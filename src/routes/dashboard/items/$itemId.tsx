import { MessageResponse } from '#/components/ai-elements/message'
import AiSummaryCard from '#/components/ai-summary-card'
import { Badge } from '#/components/ui/badge'
import { Button, buttonVariants } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible'
import {
  fetchItemByIdfn,
  saveSummaryAndGenerateTagsFn,
} from '#/data/items-service'
import { cn } from '#/lib/utils'
import { useCompletion } from '@ai-sdk/react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const MAX_SUMMARY_PROMPT_LENGTH = 50_000

export const Route = createFileRoute('/dashboard/items/$itemId')({
  component: RouteComponent,
  loader: ({ params }) => fetchItemByIdfn({ data: { id: params.itemId } }),
  staticData: { breadcrumb: 'Item' },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData.title ?? 'Item',
      },
      {
        property: 'og:title',
        content: loaderData.title ?? 'Item',
      },
    ],
  }),
})

function RouteComponent() {
  const [contentOpen, setContentOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const data = Route.useLoaderData()
  const router = useRouter()

  const { completion, isLoading, complete } = useCompletion({
    api: '/api/ai/summary',
    streamProtocol: 'text',
    initialCompletion: data.summary ?? undefined,
    body: {
      itemId: data.id,
    },
    onFinish: async (_prompt, completionText) => {
      setIsSaving(true)
      const savingToast = toast.loading('Generating tags...')
      try {
        await saveSummaryAndGenerateTagsFn({
          data: {
            id: data.id,
            summary: completionText,
            content: data.content ?? '',
          },
        })
        toast.success('Summary and tags saved', { id: savingToast })
        router.invalidate()
      } catch {
        toast.error('Failed to save tags', { id: savingToast })
      } finally {
        setIsSaving(false)
      }
    },
    onError: (error) => {
      toast.error(`Unable to generate summary: ${error.message}`)
    },
  })

  const handleGenerateSummary = () => {
    if (!data.content) {
      toast.error('No content to summarize')
      return
    }

    const prompt = data.content.slice(0, MAX_SUMMARY_PROMPT_LENGTH)
    if (prompt.length < data.content.length) {
      toast.info(
        'Content is long. Using a truncated version for summary generation.',
      )
    }

    complete(prompt)
  }

  const isGenerating = isLoading || isSaving

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex justify-start">
        <Link
          to=".."
          className={buttonVariants({
            variant: 'ghost',
            size: 'sm',
          })}
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </div>

      {data.ogImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <img
            className="size-full object-cover transition-transform duration-300 hover:scale-105"
            src={data.ogImage}
            alt={data.title ?? 'Item image'}
          />
        </div>
      )}

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{data.title ?? 'Untitled'}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {data.author && (
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4" />
              {data.author}
            </span>
          )}
          {data.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" />
              {new Date(data.publishedAt).toLocaleDateString('en-US')}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" />
            Saved {new Date(data.createdAt).toLocaleDateString('en-US')}
          </span>
        </div>
        <a
          href={data.url}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          View Original
          <ExternalLink className="size-4" />
        </a>

        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        <AiSummaryCard
          completion={completion}
          data={data}
          isLoading={isGenerating}
          onGenerateSummary={handleGenerateSummary}
        />

        {data.content && (
          <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>Show Content</span>
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform duration-300',
                    contentOpen && 'rotate-180',
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <Card>
                <CardContent className="pt-6">
                  <MessageResponse>{data.content}</MessageResponse>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  )
}
