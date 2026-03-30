import type { fetchItemByIdfn } from '#/data/items-service'
import { Loader, Sparkle } from 'lucide-react'
import { MessageResponse } from './ai-elements/message'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface AiSummaryCardProps {
  completion: string
  data: Awaited<ReturnType<typeof fetchItemByIdfn>>
  isLoading: boolean
  onGenerateSummary: () => void
}
const AiSummaryCard = ({
  completion,
  data,
  isLoading,
  onGenerateSummary,
}: AiSummaryCardProps) => {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
              AI Summary
            </h2>
            {completion ? (
              <MessageResponse parseIncompleteMarkdown>
                {completion}
              </MessageResponse>
            ) : data.summary ? (
              <MessageResponse>{data.summary}</MessageResponse>
            ) : (
              <p className="text-muted-foreground italic ">
                {data.content
                  ? 'No summary yet. Generate one with AI'
                  : 'No content available to summarize'}
              </p>
            )}
          </div>
          {data.content && !data.summary && (
            <Button
              size={'sm'}
              onClick={onGenerateSummary}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="size-4 animate-spin" />
                  <span>Summarizing</span>
                </>
              ) : (
                <>
                  <Sparkle className="size-4 mr-2" />
                  <span>Generate</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AiSummaryCard
