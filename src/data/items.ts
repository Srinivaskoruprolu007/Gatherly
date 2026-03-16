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
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { generateText } from 'ai'
import z from 'zod'
export const scrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(importSchema)
  .handler(async ({ data, context }) => {
    const user = context?.session?.user
    if (!user) throw new Error('Unauthorized')

    const item = await prisma.savedItems.create({
      data: {
        url: data.url,
        userId: user.id,
        status: 'PROCESSING',
      },
    })
    try {
      const result = await fireCrawl.scrape(data.url, {
        formats: [
          'markdown',
          {
            type: 'json',
            // prompt: 'Please extract the following fields: author, publishedAt',
            schema: extractSchema,
          },
        ],
        onlyMainContent: true,
      })

      const jsonData = result.json as z.infer<typeof extractSchema>
      let publishedAt = null
      if (jsonData.publishedAt) {
        const parsed = new Date(jsonData.publishedAt)
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed
        }
      }
      const updatedItem = await prisma.savedItems.update({
        where: {
          id: item.id,
        },
        data: {
          title: result.metadata?.title || null,
          content: result.markdown || null,
          ogImage: result.metadata?.ogImage || null,
          author: jsonData.author || null,
          publishedAt: publishedAt,
          status: 'COMPLETED',
        },
      })
      return updatedItem
    } catch {
      const failedItem = await prisma.savedItems.update({
        where: {
          id: item.id,
        },
        data: {
          status: 'FAILED',
        },
      })
      return failedItem
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
        location: {
          country: 'IN',
          languages: ['en'],
        },
      })
      return result.links
    } catch (error) {
      console.log(error)
    }
  })
export type BulkScrapeProgress = {
  completed: number
  total: number
  url: string
  status: 'success' | 'failed'
}

export const bulkUrlScapFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(
    z.object({
      urls: z.array(z.string().url()),
    }),
  )
  .handler(async function* ({ data, context }) {
    const user = context?.session?.user
    if (!user) throw new Error('Unauthorized')

    const total = data.urls.length
    let completed = 0

    for (const url of data.urls) {
      const item = await prisma.savedItems.create({
        data: {
          url,
          userId: user.id,
          status: 'PROCESSING',
        },
      })

      try {
        const result = await fireCrawl.scrape(url, {
          formats: ['markdown', { type: 'json', schema: extractSchema }],
          onlyMainContent: true,
        })

        const jsonData = result.json as z.infer<typeof extractSchema>
        let publishedAt: Date | null = null
        if (jsonData.publishedAt) {
          const parsed = new Date(jsonData.publishedAt)
          if (!isNaN(parsed.getTime())) publishedAt = parsed
        }

        await prisma.savedItems.update({
          where: { id: item.id },
          data: {
            title: result.metadata?.title || null,
            content: result.markdown || null,
            ogImage: result.metadata?.ogImage || null,
            author: jsonData.author || null,
            publishedAt,
            status: 'COMPLETED',
          },
        })

        yield {
          completed: ++completed,
          total,
          url,
          status: 'success',
        } satisfies BulkScrapeProgress
      } catch {
        await prisma.savedItems.update({
          where: { id: item.id },
          data: { status: 'FAILED' },
        })

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
  .handler(async ({ context }) => {
    const user = context?.session?.user
    if (!user) throw new Error('Unauthorized')

    try {
      // // introduce some delay
      // await new Promise((resolve) => setTimeout(resolve, 3000))
      const items = await prisma.savedItems.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return items
    } catch (error) {
      console.log(error)
    }
  })

export const fetchItemByIdfn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    const user = context?.session?.user
    if (!user) throw new Error('Unauthorized')

    try {
      const item = await prisma.savedItems.findFirst({
        where: {
          userId: user.id,
          id: data.id,
        },
      })
      if (!item) throw notFound()
      return item
    } catch (error) {
      console.log(error)
    }
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
    const user = context?.session?.user
    if (!user) throw new Error('Unauthorized')

    const existingItem = await prisma.savedItems.findFirst({
      where: {
        id: data.id,
        userId: user.id,
      },
    })

    if (!existingItem) throw notFound()

    const model = openrouter.chat('arcee-ai/trinity-large-preview:free')

    // Generate summary
    const { text: summary } = await generateText({
      model,
      system: `You are a helpful assistant that creates concise summaries of web page content.
      - Write at least 2-3 paragraphs.
      - Write in clear, professional prose that is easy to understand.
      - Be factual — do not add information not present in the content.
      - Keep the summary under 300 words unless the content is exceptionally long.
      - Do not include phrases like "This article discusses..." — get straight to the point.`,
      prompt: data.content,
    })

    // Generate tags based on the same content
    const { text: tagsRaw } = await generateText({
      model,
      system: `You are a helpful assistant that extracts concise topic tags from web page content.
      - Return only a JSON array of lowercase tag strings, e.g. ["react", "typescript", "performance", "nextjs", "technology"].
      - Produce between 3 and 8 tags.
      - Tags should be short (1-3 words), specific, and useful for filtering/search.
      - Return nothing else — no explanation, no markdown fences.`,
      prompt: data.content,
    })

    let tags: string[] = []
    try {
      const parsedTags = JSON.parse(tagsRaw)
      if (Array.isArray(parsedTags)) {
        tags = parsedTags.filter(
          (tag): tag is string => typeof tag === 'string' && tag.length > 0,
        )
      }
    } catch {
      // fall back to an empty tag list rather than crashing
      console.error('Failed to parse generated tags:', tagsRaw)
    }

    await prisma.savedItems.updateMany({
      where: {
        id: data.id,
        userId: user.id,
      },
      data: {
        summary: data.summary || summary,
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
      location: 'India',
      scrapeOptions: { formats: ['markdown'] },
    })
    return result.web?.map((item) => ({
      url: (item as SearchResultWeb).url,
      title: (item as SearchResultWeb).title,
      description: (item as SearchResultWeb).description,
    })) as SearchResultWeb[]
  })
