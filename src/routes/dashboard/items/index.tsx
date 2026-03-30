import { Card, CardHeader } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'

import { fetchItemsfn } from '#/data/items-service'
import { ItemStatus } from '#/generated/prisma/enums'
import { itemSearchSchema } from '#/schemas/items'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { lazy, Suspense, useEffect, useState } from 'react'

const ItemsList = lazy(() => import('#/components/web/items-list'))

export const Route = createFileRoute('/dashboard/items/')({
  component: Index,
  loader: ({ deps }) => ({ itemsPromise: fetchItemsfn({ data: deps }) }),
  loaderDeps: ({ search }) => search,
  validateSearch: zodValidator(itemSearchSchema),
  staticData: { breadcrumb: 'Items' },
  head: () => ({
    meta: [
      {
        title: 'Saved Items',
      },
      {
        property: 'og:title',
        content: 'Saved Items',
      },
    ],
  }),
})

const ItemsGridSkeleton = () => {
  return (
    <div className="md:grid-cols-2 grid gap-6">
      {[1, 2, 3, 4].map((_, index) => (
        <Card key={index} className="animate-pulse pt-0 overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="w-20 h-5 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
            {/* title */}
            <Skeleton className="w-full h-5 rounded-md" />
            {/* author */}
            <Skeleton className="w-1/2 h-4 rounded-md" />
            {/* description */}
            <Skeleton className="w-full h-4 rounded-md" />
            <Skeleton className="w-5/6 h-4 rounded-md" />
            {/* tags */}
            <div className="flex gap-2">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-14 h-6 rounded-full" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function Index() {
  const { itemsPromise } = Route.useLoaderData()
  const { q, status, page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
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
    <div className="flex flex-col flex-1 gap-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Items</h1>
        <p className="text-muted-foreground">Your saved articles and content</p>
      </div>
      <div className="flex gap-4">
        <Input
          placeholder="Search by title, author, URL, or tag"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
          }}
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
            <SelectValue placeholder="Filter by status" />
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
      <Suspense fallback={<ItemsGridSkeleton />}>
        <ItemsList
          data={itemsPromise}
          onPageChange={(nextPage) =>
            navigate({
              search: (prev) => ({ ...prev, page: nextPage }),
            })
          }
        />
      </Suspense>
    </div>
  )
}

export default Index
