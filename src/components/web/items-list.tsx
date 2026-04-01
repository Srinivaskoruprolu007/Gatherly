import type { fetchCollectionItemsfn, fetchItemsfn } from '#/data/items-service'
import { copyToClipboard } from '#/lib/clipboard'
import { Link } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Inbox,
  MoreHorizontal,
} from 'lucide-react'
import { type ReactNode, use } from 'react'
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

function getPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'end-ellipsis', totalPages] as const
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      'start-ellipsis',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const
  }

  return [
    1,
    'start-ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'end-ellipsis',
    totalPages,
  ] as const
}

const ItemsList = ({
  data,
  onPageChange,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  data:
    | ReturnType<typeof fetchItemsfn>
    | ReturnType<typeof fetchCollectionItemsfn>
  onPageChange: (page: number) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
}) => {
  const { items, libraryTotalItems, pagination } = use(data)
  const startItem =
    pagination.totalItems === 0
      ? 0
      : (pagination.currentPage - 1) * pagination.pageSize + 1
  const endItem = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalItems,
  )
  const pageItems = getPageItems(pagination.currentPage, pagination.totalPages)

  return (
    <div className="space-y-6">
      {pagination.totalItems > 0 && (
        <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {startItem}-{endItem} of {pagination.totalItems} items
          </p>
          <p>
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
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
                    loading="lazy"
                    decoding="async"
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
                    <p className="text-sm text-muted-foreground">
                      {item.author}
                    </p>
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
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="col-span-full">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>
                {emptyTitle ??
                  (libraryTotalItems === 0
                    ? 'No Saved Imports yet'
                    : 'No Items found')}
              </EmptyTitle>
              <EmptyMedia variant="default">
                <Inbox size={32} />
              </EmptyMedia>
              <EmptyDescription>
                {emptyDescription ??
                  (libraryTotalItems === 0
                    ? 'You have not imported any items yet.'
                    : 'No items found for applied filters.')}
              </EmptyDescription>
            </EmptyHeader>
            {emptyAction ??
              (libraryTotalItems === 0 ? (
                <EmptyContent>
                  <Link to="/dashboard/import">Import Items</Link>
                </EmptyContent>
              ) : null)}
          </Empty>
        </div>
      )}

      {pagination.totalItems > 0 && (
        <div className="rounded-lg border bg-card px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Pagination</p>
              <p className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage}
                onClick={(event) => {
                  event.preventDefault()
                  if (!pagination.hasPreviousPage) return
                  onPageChange(pagination.currentPage - 1)
                }}
              >
                <ChevronLeft className="size-4" />
                <span>Previous</span>
              </Button>
              {pageItems.map((pageItem) =>
                typeof pageItem === 'number' ? (
                  <Button
                    key={pageItem}
                    variant={
                      pageItem === pagination.currentPage
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={(event) => {
                      event.preventDefault()
                      if (pageItem === pagination.currentPage) return
                      onPageChange(pageItem)
                    }}
                  >
                    {pageItem}
                  </Button>
                ) : (
                  <span
                    key={pageItem}
                    className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </span>
                ),
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={(event) => {
                  event.preventDefault()
                  if (!pagination.hasNextPage) return
                  onPageChange(pagination.currentPage + 1)
                }}
              >
                <span>Next</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemsList
