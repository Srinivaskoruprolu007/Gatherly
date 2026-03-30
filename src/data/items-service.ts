import { prisma } from '#/db'
import { fireCrawl } from '#/lib/fire-crawl'
import { openrouter } from '#/lib/open-router'
import { authFnMiddleware } from '#/middlewares/auth'
import {
  bulkImportSchema,
  extractSchema,
  importSchema,
  searchSchema,
} from '#/schemas/import'
import { itemSearchSchema } from '#/schemas/items'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { generateObject } from 'ai'
import z from 'zod'

const MAX_AI_CONTENT_LENGTH = 50_000
const ITEMS_PAGE_SIZE = 8
const FAILED_ITEM_RETENTION_MS = 60 * 60 * 1000

const summaryAndTagsSchema = z.object({
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)).min(3).max(8),
})

const tagsSchema = z.object({
  tags: z.array(z.string().min(1)).min(3).max(8),
})

function normalizeAiContent(content: string) {
  return content.trim().slice(0, MAX_AI_CONTENT_LENGTH)
}

function normalizeTags(tags: string[]) {
  return [
    ...new Set(
      tags
        .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, ' '))
        .filter(Boolean),
    ),
  ].slice(0, 8)
}

function parseExtractedMetadata(value: unknown) {
  const parsed = extractSchema.safeParse(value)

  if (!parsed.success) {
    return {
      author: null,
      publishedAt: null,
    }
  }

  return parsed.data
}

function parsePublishedAt(publishedAt: string | null | undefined) {
  if (!publishedAt) return null

  const parsed = new Date(publishedAt)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

async function generateSummaryAndTags(title: string | null, content: string) {
  const normalizedContent = normalizeAiContent(content)

  if (!normalizedContent) {
    return { summary: null, tags: [] }
  }

  try {
    const { object } = await generateObject({
      model: openrouter.chat('stepfun/step-3.5-flash:free'),
      schema: summaryAndTagsSchema,
      system: `You are a helpful assistant that turns web page content into reusable knowledge library metadata.
- Write a concise summary in 2-3 short paragraphs.
- Be factual and do not invent details.
- Keep the summary under 300 words.
- Return 3-8 lowercase tags that are specific and useful for search.`,
      prompt: `Title: ${title ?? 'Untitled'}\n\nContent:\n${normalizedContent}`,
    })

    return {
      summary: object.summary.trim(),
      tags: normalizeTags(object.tags),
    }
  } catch (error) {
    console.error('Unable to generate summary and tags during import.', error)
    return { summary: null, tags: [] }
  }
}

async function generateTags(title: string | null, content: string) {
  const normalizedContent = normalizeAiContent(content)

  if (!normalizedContent) {
    return []
  }

  try {
    const { object } = await generateObject({
      model: openrouter.chat('stepfun/step-3.5-flash:free'),
      schema: tagsSchema,
      system: `You are a helpful assistant that extracts concise topic tags from web page content.
- Return 3-8 lowercase tags.
- Keep tags short, specific, and useful for filtering.
- Avoid generic filler tags.`,
      prompt: `Title: ${title ?? 'Untitled'}\n\nContent:\n${normalizedContent}`,
    })

    return normalizeTags(object.tags)
  } catch (error) {
    console.error('Unable to generate tags.', error)
    return []
  }
}

async function findLatestItemByUrl(userId: string, url: string) {
  return prisma.savedItems.findFirst({
    where: {
      userId,
      url,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

async function purgeExpiredFailedItems(userId: string) {
  const expirationThreshold = new Date(Date.now() - FAILED_ITEM_RETENTION_MS)

  await prisma.savedItems.deleteMany({
    where: {
      userId,
      status: 'FAILED',
      updatedAt: {
        lt: expirationThreshold,
      },
    },
  })
}

async function prepareItemForImport(options: {
  existingItemId?: string
  url: string
  userId: string
}) {
  if (options.existingItemId) {
    return prisma.savedItems.update({
      where: {
        id: options.existingItemId,
      },
      data: {
        status: 'PROCESSING',
        title: null,
        content: null,
        summary: null,
        tags: [],
        author: null,
        publishedAt: null,
        ogImage: null,
      },
    })
  }

  return prisma.savedItems.create({
    data: {
      url: options.url,
      userId: options.userId,
      status: 'PROCESSING',
    },
  })
}

async function completeImportedItem(itemId: string, url: string) {
  const result = await fireCrawl.scrape(url, {
    formats: [
      'markdown',
      {
        type: 'json',
        prompt: 'Please extract the following fields: author, publishedAt',
      },
    ],
    onlyMainContent: true,
  })

  const metadata = parseExtractedMetadata(result.json)
  const content = result.markdown || ''
  const generated = await generateSummaryAndTags(
    result.metadata?.title || null,
    content,
  )

  return prisma.savedItems.update({
    where: {
      id: itemId,
    },
    data: {
      title: result.metadata?.title || null,
      content: content || null,
      summary: generated.summary,
      tags: generated.tags,
      ogImage: result.metadata?.ogImage || null,
      author: metadata.author || null,
      publishedAt: parsePublishedAt(metadata.publishedAt),
      status: 'COMPLETED',
    },
  })
}

export const scrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(importSchema)
  .handler(async ({ data, context }) => {
    const user = context.session.user
    await purgeExpiredFailedItems(user.id)

    const existingItem = await findLatestItemByUrl(user.id, data.url)

    if (existingItem && existingItem.status !== 'FAILED') {
      return {
        item: existingItem,
        outcome: 'skipped' as const,
        message:
          existingItem.status === 'PROCESSING'
            ? 'This URL is already being imported.'
            : 'This URL is already in your library.',
      }
    }

    const item = await prepareItemForImport({
      existingItemId: existingItem?.id,
      url: data.url,
      userId: user.id,
    })

    try {
      const updatedItem = await completeImportedItem(item.id, data.url)

      return {
        item: updatedItem,
        outcome: existingItem ? ('retried' as const) : ('created' as const),
        message: existingItem
          ? 'Re-imported the failed URL successfully.'
          : 'URL imported successfully.',
      }
    } catch (error) {
      await prisma.savedItems.update({
        where: {
          id: item.id,
        },
        data: {
          status: 'FAILED',
        },
      })

      console.error('Unable to scrape URL.', error)
      throw new Error('Unable to scrape this URL')
    }
  })

export const mapUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(bulkImportSchema)
  .handler(async ({ data }) => {
    try {
      const result = await fireCrawl.map(data.url, {
        limit: 25,
        search: data.search,
      })
      return result.links
    } catch (error) {
      console.error('Unable to map URLs for bulk import.', error)
      throw new Error('Unable to map URLs for this website')
    }
  })

export type BulkScrapeProgress = {
  completed: number
  total: number
  url: string
  status: 'success' | 'failed' | 'skipped'
}

export const bulkUrlScapFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(
    z.object({
      urls: z.array(z.string().url()),
    }),
  )
  .handler(async function* ({ data, context }) {
    const user = context.session.user
    await purgeExpiredFailedItems(user.id)

    const total = data.urls.length
    let completed = 0

    for (const url of data.urls) {
      const existingItem = await findLatestItemByUrl(user.id, url)

      if (existingItem && existingItem.status !== 'FAILED') {
        yield {
          completed: ++completed,
          total,
          url,
          status: 'skipped',
        } satisfies BulkScrapeProgress
        continue
      }

      const item = await prepareItemForImport({
        existingItemId: existingItem?.id,
        url,
        userId: user.id,
      })

      try {
        await completeImportedItem(item.id, url)

        yield {
          completed: ++completed,
          total,
          url,
          status: 'success',
        } satisfies BulkScrapeProgress
      } catch (error) {
        await prisma.savedItems.update({
          where: { id: item.id },
          data: { status: 'FAILED' },
        })

        console.error(`Unable to import URL: ${url}`, error)

        yield {
          completed: ++completed,
          total,
          url,
          status: 'failed',
        } satisfies BulkScrapeProgress
      }
    }
  })

export const fetchItemsfn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .inputValidator(itemSearchSchema)
  .handler(async ({ data, context }) => {
    const user = context.session.user
    await purgeExpiredFailedItems(user.id)

    const normalizedQuery = data.q.trim().toLowerCase()
    const where = {
      userId: user.id,
      ...(data.status !== 'all' ? { status: data.status } : {}),
      ...(normalizedQuery
        ? {
            OR: [
              {
                title: {
                  contains: normalizedQuery,
                  mode: 'insensitive' as const,
                },
              },
              {
                summary: {
                  contains: normalizedQuery,
                  mode: 'insensitive' as const,
                },
              },
              {
                author: {
                  contains: normalizedQuery,
                  mode: 'insensitive' as const,
                },
              },
              {
                url: {
                  contains: normalizedQuery,
                  mode: 'insensitive' as const,
                },
              },
              {
                tags: {
                  has: normalizedQuery,
                },
              },
            ],
          }
        : {}),
    }

    const [libraryTotalItems, totalItems] = await Promise.all([
      prisma.savedItems.count({
        where: {
          userId: user.id,
        },
      }),
      prisma.savedItems.count({ where }),
    ])

    const totalPages =
      totalItems === 0 ? 1 : Math.ceil(totalItems / ITEMS_PAGE_SIZE)
    const currentPage = Math.min(data.page, totalPages)
    const items = await prisma.savedItems.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (currentPage - 1) * ITEMS_PAGE_SIZE,
      take: ITEMS_PAGE_SIZE,
    })

    return {
      items,
      libraryTotalItems,
      pagination: {
        currentPage,
        pageSize: ITEMS_PAGE_SIZE,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    }
  })

export const fetchItemByIdfn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const user = context.session.user
    await purgeExpiredFailedItems(user.id)

    const item = await prisma.savedItems.findFirst({
      where: {
        userId: user.id,
        id: data.id,
      },
    })

    if (!item) throw notFound()

    return item
  })

export const saveSummaryAndGenerateTagsFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(
    z.object({
      id: z.string(),
      summary: z.string().min(1),
      content: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    const user = context.session.user

    const existingItem = await prisma.savedItems.findFirst({
      where: {
        id: data.id,
        userId: user.id,
      },
    })

    if (!existingItem) throw notFound()

    const tags =
      existingItem.tags.length > 0
        ? existingItem.tags
        : await generateTags(existingItem.title || null, data.content)

    await prisma.savedItems.update({
      where: {
        id: data.id,
      },
      data: {
        summary: data.summary.trim(),
        tags,
      },
    })

    return prisma.savedItems.findFirst({
      where: {
        id: data.id,
        userId: user.id,
      },
    })
  })

export const searchWebFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(searchSchema)
  .handler(async ({ data }) => {
    const result = await fireCrawl.search(data.query, {
      limit: 10,
      scrapeOptions: { formats: ['markdown'] },
    })

    return result.web?.map((item) => ({
      url: (item as SearchResultWeb).url,
      title: (item as SearchResultWeb).title,
      description: (item as SearchResultWeb).description,
    })) as SearchResultWeb[]
  })
