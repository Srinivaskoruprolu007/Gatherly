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

import { fetchItemsfn } from '#/data/items'
import { ItemStatus } from '#/generated/prisma/enums'
import { itemSearchSchema } from '#/schemas/items'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { lazy, Suspense, useEffect, useState } from 'react'

const ItemsList = lazy(() => import('#/components/web/items-list'))

export const Route = createFileRoute('/dashboard/items/')({
  component: Index,
  loader: () => ({ itemsPromise: fetchItemsfn() }),
  loaderDeps: () => ({}),
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
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((_, index) => (
        <Card key={index} className="overflow-hidden pt-0 animate-pulse">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
            {/* title */}
            <Skeleton className="h-5 w-full rounded-md" />
            {/* author */}
            <Skeleton className="h-4 w-1/2 rounded-md" />
            {/* description */}
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            {/* tags */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function Index() {
  const { itemsPromise } = Route.useLoaderData()
  const { q, status } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [searchInput, setSearchInput] = useState(q)

  useEffect(() => {
    if (searchInput === q) return
    const timeoutId = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, q: searchInput }) })
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchInput, q, navigate])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Items</h1>
        <p className="text-muted-foreground">Your saved articles and content</p>
      </div>
      <div className="flex gap-4">
        <Input
          placeholder="Search by title or tag"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value)
          }}
        />
        <Select
          value={status}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({ ...prev, status: value as typeof status }),
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
        <ItemsList data={itemsPromise} q={q} status={status} />
      </Suspense>
    </div>
  )
}

export default Index
