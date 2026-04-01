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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  assignItemToCollectionFn,
  createCollectionFn,
  fetchCollectionsfn,
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
import { useEffect, useState } from 'react'
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
  const [collections, setCollections] = useState<
    { id: string; name: string }[]
  >([])
  const [selectedCollectionId, setSelectedCollectionId] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isAssigningCollection, setIsAssigningCollection] = useState(false)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false)
  const data = Route.useLoaderData()
  const router = useRouter()

  useEffect(() => {
    let active = true

    fetchCollectionsfn()
      .then((result) => {
        if (active) setCollections(result)
      })
      .catch((error) => {
        console.error(error)
      })

    return () => {
      active = false
    }
  }, [])

  const assignedCollections = data.collections ?? []

  const handleAssignCollection = async () => {
    if (!selectedCollectionId) {
      toast.error('Choose a collection first.')
      return
    }

    setIsAssigningCollection(true)
    const assignToast = toast.loading('Assigning item to collection...')

    try {
      await assignItemToCollectionFn({
        data: {
          itemId: data.id,
          collectionId: selectedCollectionId,
        },
      })
      toast.success('Item assigned to collection', { id: assignToast })
      setSelectedCollectionId('')
      await router.invalidate()
    } catch (error) {
      toast.error('Unable to assign item to collection', { id: assignToast })
      console.error(error)
    } finally {
      setIsAssigningCollection(false)
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Collection name is required.')
      return
    }

    setIsCreatingCollection(true)
    const createToast = toast.loading('Creating collection...')

    try {
      const collection = await createCollectionFn({
        data: { name: newCollectionName.trim() },
      })
      await assignItemToCollectionFn({
        data: {
          itemId: data.id,
          collectionId: collection.id,
        },
      })
      toast.success('Collection created and item assigned', { id: createToast })
      setNewCollectionName('')
      setCollectionDialogOpen(false)
      await router.invalidate()
    } catch (error) {
      toast.error('Unable to create collection', { id: createToast })
      console.error(error)
    } finally {
      setIsCreatingCollection(false)
    }
  }

  const collectionOptions = collections.map((collection) => (
    <SelectItem key={collection.id} value={collection.id}>
      {collection.name}
    </SelectItem>
  ))

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
        <h1 className="text-3xl font-bold tracking-tight">
          {data.title ?? 'Untitled'}
        </h1>

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

        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Collections</p>
              <p className="text-sm text-muted-foreground">
                Organize this item into custom collections.
              </p>
            </div>
            <Dialog
              open={collectionDialogOpen}
              onOpenChange={setCollectionDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm">Create & assign collection</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new collection</DialogTitle>
                  <DialogDescription>
                    Add a new custom collection and assign this item to it.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <Label htmlFor="collection-name">Collection name</Label>
                  <Input
                    id="collection-name"
                    value={newCollectionName}
                    onChange={(event) =>
                      setNewCollectionName(event.target.value)
                    }
                    placeholder="e.g. Research, Favorites"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateCollection}
                    disabled={isCreatingCollection}
                  >
                    {isCreatingCollection ? 'Saving…' : 'Create collection'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {assignedCollections.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedCollections.map((collection) => (
                <Badge key={collection.id} variant="outline">
                  {collection.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This item is not part of any collection yet.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-[1.5fr_auto] sm:items-end">
            <div>
              <Label htmlFor="collection-select">
                Assign existing collection
              </Label>
              <Select
                value={selectedCollectionId}
                onValueChange={setSelectedCollectionId}
              >
                <SelectTrigger id="collection-select" className="w-full">
                  <SelectValue placeholder="Choose a collection" />
                </SelectTrigger>
                <SelectContent>{collectionOptions}</SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              disabled={!selectedCollectionId || isAssigningCollection}
              onClick={async () => {
                await handleAssignCollection()
              }}
            >
              {isAssigningCollection ? 'Assigning…' : 'Assign'}
            </Button>
          </div>
        </div>

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
