import { Button } from '#/components/ui/button'
import { Card, CardHeader } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import ItemsList from '#/components/web/items-list'
import { fetchCollectionItemsfn } from '#/data/items-service'
import { ItemStatus } from '#/generated/prisma/enums'
import { itemSearchSchema } from '#/schemas/items'
import { createFileRoute, Link } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { ArrowLeft } from 'lucide-react'
import { Suspense, use, useEffect, useState } from 'react'

export const Route = createFileRoute('/dashboard/collections/$collectionId')({
  component: CollectionRoute,
  loader: ({ params, deps }) => {
    const search = deps as {
      q?: string
      status?: string
      page?: number
    }

    return {
      itemsPromise: fetchCollectionItemsfn({
        data: {
          collectionId: params.collectionId,
          q: search.q ?? '',
          status: (search.status as 'all') ?? 'all',
          page: search.page ?? 1,
        },
      }),
    }
  },
  loaderDeps: ({ search }) => search,
  validateSearch: zodValidator(itemSearchSchema),
  staticData: { breadcrumb: 'Collection' },
  head: ({ params }) => ({
    meta: [
      {
        title: `Collection ${params.collectionId}`,
      },
      {
        property: 'og:title',
        content: `Collection ${params.collectionId}`,
      },
    ],
  }),
})

const ItemsGridSkeleton = () => {
  return (
    <div className="md:grid-cols-2 grid gap-6">
      {[1, 2, 3, 4].map((index) => (
        <Card key={index} className="animate-pulse pt-0 overflow-hidden">
          <div className="aspect-video bg-muted" />
          <CardHeader className="space-y-3 p-4">
            <div className="h-5 w-32 rounded-md bg-muted" />
            <div className="h-4 w-1/2 rounded-md bg-muted" />
            <div className="h-4 w-full rounded-md bg-muted" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function CollectionRoute() {
  const { itemsPromise } = Route.useLoaderData()
  const { q = '', status = 'all' } = Route.useSearch()
  const navigate = Route.useNavigate()
  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => {
    setSearchInput(q)
  }, [q])

  useEffect(() => {
    if (searchInput === q) return
    const timeoutId = setTimeout(() => {
      navigate({
        replace: true,
        search: (prev) => ({ ...prev, q: searchInput, page: 1 }),
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchInput, q, navigate])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" asChild>
          <Link
            className="inline-flex items-center gap-2 text-sm text-primary"
            to="/dashboard/collections"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search within collection"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Select
            value={status}
            onValueChange={(value) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  status: value as typeof status,
                  page: 1,
                }),
              })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.values(ItemStatus).map((itemStatus) => (
                <SelectItem key={itemStatus} value={itemStatus}>
                  {itemStatus.charAt(0) + itemStatus.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-3 p-6">
          <Suspense
            fallback={<div className="h-12 w-48 rounded-md bg-slate-100" />}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CollectionTitle itemsPromise={itemsPromise} />
              <div className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                Browse your saved items for this collection.
              </div>
            </div>
          </Suspense>
        </CardHeader>
      </Card>

      <Suspense fallback={<ItemsGridSkeleton />}>
        <ItemsList
          data={itemsPromise}
          onPageChange={(nextPage) =>
            navigate({
              search: (prev) => ({ ...prev, page: nextPage }),
            })
          }
          emptyTitle="No items in this collection"
          emptyDescription="Add items to this collection from the item detail screen."
        />
      </Suspense>
    </div>
  )
}

function CollectionTitle({
  itemsPromise,
}: {
  itemsPromise: ReturnType<typeof fetchCollectionItemsfn>
}) {
  const { collection, pagination } = use(itemsPromise)

  return (
    <div>
      <h1 className="text-2xl font-bold">{collection.name}</h1>
      <p className="text-muted-foreground">
        {pagination.totalItems} item{pagination.totalItems === 1 ? '' : 's'} in
        this collection
      </p>
    </div>
  )
}

export default CollectionRoute
