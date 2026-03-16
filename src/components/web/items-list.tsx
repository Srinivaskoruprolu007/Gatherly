import type { fetchItemsfn } from '#/data/items'
import { copyToClipboard } from '#/lib/clipboard'
import type { ItemSearch } from '#/lib/types'
import { Link } from '@tanstack/react-router'
import { Copy, Inbox } from 'lucide-react'
import { use } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle } from '../ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty'

function getItemPreviewText(
  summary: string | null | undefined,
  content: string | null | undefined,
) {
  const source = summary?.trim() || content?.trim()

  if (!source) return null

  return source
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const ItemsList = ({
  data,
  q,
  status,
}: {
  q: ItemSearch['q']
  status: ItemSearch['status']
  data: ReturnType<typeof fetchItemsfn>
}) => {
  const items = use(data)
  const filteredItems = items?.filter((item) => {
    const matchedQuery =
      q === '' ||
      item.title?.toLocaleLowerCase().includes(q) ||
      item.tags.some((tag) => tag.toLocaleLowerCase().includes(q))
    const matchedStatus = status === 'all' || item.status === status
    return matchedQuery && matchedStatus
  })
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filteredItems?.map((item) => {
        const previewText = getItemPreviewText(item.summary, item.content)
        const visibleTags = item.tags.slice(0, 4)

        return (
          <Card
            className="group overflow-hidden pt-0 transition-all hover:shadow-md"
            key={item.id}
          >
            <Link to="/dashboard/items/$itemId" params={{ itemId: item.id }}>
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={
                    item.ogImage ||
                    `https://picsum.photos/seed/${item.id}/800/450`
                  }
                  alt={item.title ?? 'article thumbnail'}
                  className="h-full w-full object-cover transition-all group-hover:scale-105"
                />
              </div>
              <CardHeader className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={
                      item.status === 'COMPLETED' ? 'default' : 'secondary'
                    }
                  >
                    {item.status.toLowerCase()}
                  </Badge>
                  <Button
                    onClick={async (e) => {
                      e.preventDefault()
                      await copyToClipboard(item.url)
                    }}
                    variant={'outline'}
                    size={'icon'}
                    className="size-8"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <CardTitle className="line-clamp-1 text-xl leading-tight transition-colors group-hover:text-primary">
                  {item.title}
                </CardTitle>
                {item.author && (
                  <p className="text-sm text-muted-foreground">{item.author}</p>
                )}
                {previewText && (
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {previewText}
                  </p>
                )}
                {visibleTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {visibleTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="font-normal"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
            </Link>
          </Card>
        )
      })}
      {/* Empty state */}
      {!filteredItems?.length && (
        <div className="col-span-full">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>
                {items?.length === 0 ? 'No Save Imports yet' : 'No Items found'}
              </EmptyTitle>
              <EmptyMedia variant="default">
                <Inbox size={32} />
              </EmptyMedia>
              <EmptyDescription>
                {items?.length === 0
                  ? 'You have not imported any items yet.'
                  : `No items found for applied filters.`}
              </EmptyDescription>
            </EmptyHeader>
            {items?.length === 0 && (
              <EmptyContent>
                <Link to="/dashboard/import">Import Items</Link>
              </EmptyContent>
            )}
          </Empty>
        </div>
      )}
    </div>
  )
}

export default ItemsList
