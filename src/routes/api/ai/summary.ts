import { prisma } from '#/db'
import { openrouter } from '#/lib/open-router'
import { retryAsync } from '#/lib/retry'
import { createFileRoute } from '@tanstack/react-router'
import { streamText } from 'ai'
import { z } from 'zod'

const MAX_SUMMARY_PROMPT_LENGTH = 50_000

const AI_SUMMARY_RETRY_OPTIONS = {
  retries: 2,
  minDelayMs: 250,
  maxDelayMs: 3000,
  factor: 2,
  jitter: true,
}

const bodySchema = z.object({
  itemId: z.string().min(1),
  prompt: z.string().min(1),
})

const SYSTEM_PROMPT = `You are a helpful assistant that creates concise summaries of web page content.
Follow these rules:
- Write in clear, professional prose that is easy to understand.
- Be factual — do not add information not present in the content
- Keep the summary under 300 words unless the content is exceptionally long
- Do not include phrases like "This article discusses..." — get straight to the point`

export const Route = createFileRoute('/api/ai/summary')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        if (!context?.session) {
          return new Response('Unauthorized', { status: 401 })
        }

        const body = await request.json().catch(() => null)
        const parsed = bodySchema.safeParse(body)

        if (!parsed.success) {
          return new Response(
            JSON.stringify({
              error: 'Invalid request body',
              issues: parsed.error.flatten(),
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          )
        }

        const { itemId, prompt } = parsed.data
        const normalizedPrompt = prompt.slice(0, MAX_SUMMARY_PROMPT_LENGTH)

        const item = await prisma.savedItems.findFirst({
          where: { id: itemId, userId: context.session.user.id },
          select: { id: true, title: true },
        })

        if (!item) {
          return new Response('Item not found', { status: 404 })
        }

        const result = await retryAsync(
          async () =>
            streamText({
              model: openrouter.chat('stepfun/step-3.5-flash:free'),
              system: SYSTEM_PROMPT,
              prompt: `Title: ${item.title ?? 'Untitled'}\n\nContent:\n${normalizedPrompt}`,
              temperature: 0.5,
            }),
          AI_SUMMARY_RETRY_OPTIONS,
        )

        return result.toTextStreamResponse()
      },
    },
  },
})
