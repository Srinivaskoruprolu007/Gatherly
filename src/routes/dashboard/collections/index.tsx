import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Skeleton } from '#/components/ui/skeleton'
import { createCollectionFn, fetchCollectionsfn } from '#/data/items-service'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { FolderOpen } from 'lucide-react'
import { Suspense, use, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/collections/')({
  component: CollectionsIndex,
  loader: () => ({ collectionsPromise: fetchCollectionsfn() }),
  staticData: { breadcrumb: 'Collections' },
  head: () => ({
    meta: [
      {
        title: 'Collections',
      },
      {
        property: 'og:title',
        content: 'Collections',
      },
    ],
  }),
})

function CollectionsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((key) => (
        <Card key={key} className="animate-pulse">
          <CardHeader className="space-y-3 p-6">
            <Skeleton className="h-6 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function CollectionsList({
  collections,
}: {
  collections: Array<{ id: string; name: string; _count: { items: number } }>
}) {
  if (collections.length === 0) {
    return (
      <Card className="border-dashed border-muted/50">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="default">
              <FolderOpen size={32} />
            </EmptyMedia>
            <EmptyTitle>No collections yet</EmptyTitle>
            <EmptyDescription>
              Create a collection to organize saved items.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <p className="text-sm text-muted-foreground">
              Collections help you group your articles and research for faster
              retrieval.
            </p>
          </EmptyContent>
        </Empty>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {collections.map((collection) => (
        <Card
          key={collection.id}
          className="group overflow-hidden border hover:-translate-y-1 hover:shadow-lg transition-transform"
        >
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{collection.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {collection._count.items} item
                  {collection._count.items === 1 ? '' : 's'}
                </p>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link to={`/dashboard/collections/${collection.id}` as any}>
                  Open
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CollectionsIndex() {
  const { collectionsPromise } = Route.useLoaderData()
  const collections = use(collectionsPromise)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [collectionName, setCollectionName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreateCollection = async () => {
    if (!collectionName.trim()) {
      toast.error('Please enter a collection name.')
      return
    }

    setIsCreating(true)
    const actionToast = toast.loading('Creating collection...')

    try {
      await createCollectionFn({ data: { name: collectionName.trim() } })
      toast.success('Collection created', { id: actionToast })
      setCollectionName('')
      setDialogOpen(false)
      await router.invalidate()
    } catch (error) {
      toast.error('Unable to create collection', { id: actionToast })
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Collections</h1>
          <p className="text-muted-foreground">
            Organize your saved items into reusable collections.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <div className="flex items-center gap-2">
            <DialogTrigger asChild>
              <Button size="sm">Create Collection</Button>
            </DialogTrigger>
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new collection</DialogTitle>
              <DialogDescription>
                Collections make it easy to group and browse saved items.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Label htmlFor="collection-name">Collection name</Label>
              <Input
                id="collection-name"
                value={collectionName}
                onChange={(event) => setCollectionName(event.target.value)}
                placeholder="e.g. Research, Favorites"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleCreateCollection} disabled={isCreating}>
                {isCreating ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Suspense fallback={<CollectionsSkeleton />}>
        <CollectionsList collections={collections} />
      </Suspense>
    </div>
  )
}

export default CollectionsIndex
