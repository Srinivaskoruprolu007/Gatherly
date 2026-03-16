import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Progress } from '#/components/ui/progress'
import {
  bulkUrlScapFn,
  searchWebFn,
  type BulkScrapeProgress,
} from '#/data/items'
import { searchSchema } from '#/schemas/import'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, Search, Sparkle } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/discover')({
  component: RouteComponent,
  staticData: { breadcrumb: 'Discover' },
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [isImportPending, startImportTransition] = useTransition()
  const [searchResult, setSearchResult] = useState<Array<SearchResultWeb>>([])
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)

  const handleToggleUrl = (url: string) => {
    const newSelected = new Set(selectedLinks)
    if (newSelected.has(url)) {
      newSelected.delete(url)
    } else {
      newSelected.add(url)
    }
    setSelectedLinks(newSelected)
  }

  const handleImportSelected = () => {
    if (selectedLinks.size === 0) {
      toast.info('No URLs selected to import')
      return
    }

    startImportTransition(async () => {
      try {
        setProgress({
          completed: 0,
          total: selectedLinks.size,
          url: '',
          status: 'success',
        })

        let successCount = 0
        let failedCount = 0

        const stream = await bulkUrlScapFn({
          data: { urls: Array.from(selectedLinks) },
        })

        for await (const update of stream) {
          setProgress(update)
          if (update.status === 'success') {
            successCount++
          } else {
            failedCount++
          }
        }

        if (failedCount === 0) {
          toast.success(
            `Successfully imported ${successCount} URL${successCount === 1 ? '' : 's'}`,
          )
        } else if (successCount === 0) {
          toast.error(
            `Failed to import all ${failedCount} URL${failedCount === 1 ? '' : 's'}`,
          )
        } else {
          toast.warning(
            `Imported ${successCount} URL${successCount === 1 ? '' : 's'}, ${failedCount} failed`,
          )
        }

        setSelectedLinks(new Set())
      } catch {
        toast.error('Unable to import selected URLs')
      } finally {
        setProgress(null)
      }
    })
  }

  const form = useForm({
    defaultValues: { query: '' },
    validators: { onSubmit: searchSchema },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        try {
          const result = await searchWebFn({ data: { query: value.query } })
          setSearchResult(result)
          setSelectedLinks(new Set())
          if (result.length === 0) {
            toast.info('No articles found for this topic')
          }
        } catch {
          setSearchResult([])
          setSelectedLinks(new Set())
          toast.error('Unable to search the web right now')
        }
      })
    },
  })

  const progressPercent = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-2 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Discover</h1>
          <p className="text-muted-foreground pt-2">
            Search the web for articles on any topic
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle className="size-4 text-primary" />
              <span>Topic Search</span>
            </CardTitle>
            <CardDescription>
              Search the web for content and import what you find interesting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <FieldGroup>
                <form.Field
                  name="query"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Topic</FieldLabel>
                        <Input
                          id={field.name}
                          placeholder="Enter a topic e.g. React, Next.js, Tailwind CSS"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="size-4" />
                      <span>Search</span>
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>

            <div className="max-h-80 overflow-y-auto rounded-md border">
              {searchResult.length > 0 ? (
                searchResult.map((link) => (
                  <Label
                    key={link.url}
                    className="flex cursor-pointer items-start gap-3 border-b p-4 last:border-0 hover:bg-muted/50 has-checked:bg-primary/5"
                  >
                    <Checkbox
                      checked={selectedLinks.has(link.url)}
                      className="mt-1"
                      onCheckedChange={() => handleToggleUrl(link.url)}
                    />
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium leading-tight">
                        {link.title}
                      </p>
                      <p className="break-all text-xs text-muted-foreground">
                        {link.url}
                      </p>
                      {link.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {link.description}
                        </p>
                      )}
                    </div>
                  </Label>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                  <Search className="size-6 opacity-40" />
                  <p>Search for a topic to see results here</p>
                </div>
              )}
            </div>

            {/* Progress indicator — shown only during import */}
            {isImportPending && progress && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="max-w-[75%] truncate">
                    {progress.url ? (
                      <>
                        Importing{' '}
                        <span className="font-medium text-foreground">
                          {progress.url}
                        </span>
                      </>
                    ) : (
                      'Starting import...'
                    )}
                  </span>
                  <span>
                    {progress.completed} / {progress.total}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            )}

            {searchResult.length > 0 && (
              <Button
                className="w-full"
                onClick={handleImportSelected}
                disabled={isImportPending || selectedLinks.size === 0}
              >
                {isImportPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>
                      Importing{' '}
                      {progress
                        ? `${progress.completed} of ${progress.total}`
                        : '...'}
                    </span>
                  </>
                ) : (
                  <span>
                    Import
                    {selectedLinks.size > 0
                      ? ` ${selectedLinks.size}`
                      : ''}{' '}
                    Selected
                  </span>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
