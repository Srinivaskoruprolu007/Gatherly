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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Progress } from '#/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  bulkUrlScapFn,
  mapUrlFn,
  scrapeUrlFn,
  type BulkScrapeProgress,
} from '#/data/items'
import { bulkImportSchema, importSchema } from '#/schemas/import'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { GlobeIcon, LinkIcon, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/import')({
  component: RouteComponent,
  staticData: { breadcrumb: 'Import' },
})

function RouteComponent() {
  const [discoveredLinks, setDiscoveredLinks] = useState<SearchResultWeb[]>([])
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
  const [hasSearched, setHasSearched] = useState(false)
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isBulkPending, startBulkTransition] = useTransition()

  const handleSelectAll = () => {
    if (selectedLinks.size === discoveredLinks.length) {
      setSelectedLinks(new Set())
    } else {
      setSelectedLinks(new Set(discoveredLinks.map((l) => l.url ?? '')))
    }
  }

  const handleToggleUrl = (url: string) => {
    const newSelected = new Set(selectedLinks)
    if (newSelected.has(url)) {
      newSelected.delete(url)
    } else {
      newSelected.add(url)
    }
    setSelectedLinks(newSelected)
  }

  const handleBulkImport = async () => {
    if (selectedLinks.size === 0) {
      toast.info('No URLs selected to import')
      return
    }

    startBulkTransition(async () => {
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
        toast.error('Unable to import URLs')
      } finally {
        setProgress(null)
      }
    })
  }

  const form = useForm({
    defaultValues: {
      url: '',
    },
    validators: {
      onSubmit: importSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        try {
          await scrapeUrlFn({ data: { url: value.url } })
          toast.success('URL scraped successfully')
          form.reset()
        } catch {
          toast.error('Unable to scrape this URL')
        }
      })
    },
  })

  const bulkForm = useForm({
    defaultValues: {
      url: '',
      search: '',
    },
    validators: {
      onSubmit: bulkImportSchema,
    },
    onSubmit: ({ value }) => {
      startBulkTransition(async () => {
        try {
          const links =
            (await mapUrlFn({
              data: { url: value.url, search: value.search },
            })) ?? []

          setDiscoveredLinks(links)
          setSelectedLinks(new Set())
          setHasSearched(true)
          toast.success(
            `Found ${links.length} URL${links.length === 1 ? '' : 's'}`,
          )
        } catch {
          setDiscoveredLinks([])
          setHasSearched(true)
          toast.error('Unable to map URLs for this website')
        }
      })
    },
  })

  const progressPercent = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0

  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Import Data</h1>
          <p className="pt-2 text-muted-foreground">
            Import your data from a JSON file.
          </p>
        </div>

        <Tabs orientation="horizontal" defaultValue="single">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <LinkIcon className="size-4" />
              Single URL
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-2">
              <GlobeIcon className="size-4" />
              Bulk Import
            </TabsTrigger>
          </TabsList>

          {/* Single URL Tab */}
          <TabsContent className="w-full" value="single">
            <Card>
              <CardHeader>
                <CardTitle>Single URL</CardTitle>
                <CardDescription>
                  Scrape and save content from any website URL.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <form.Field name="url">
                      {(field) => (
                        <Field>
                          <FieldLabel>URL</FieldLabel>
                          <FieldDescription>
                            Enter the URL of the website you want to scrape.
                          </FieldDescription>
                          <Input
                            id={field.name}
                            type="url"
                            name={field.name}
                            value={field.state.value}
                            placeholder="https://tanstack.com/start"
                            required
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            autoComplete="off"
                            disabled={isPending}
                            aria-invalid={field.state.meta.errors.length > 0}
                          />
                          {field.state.meta.errors.length > 0 && (
                            <FieldError>
                              {field.state.meta.errors[0]?.message}
                            </FieldError>
                          )}
                        </Field>
                      )}
                    </form.Field>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" /> Scraping...
                        </>
                      ) : (
                        'Scrape'
                      )}
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Import Tab */}
          <TabsContent className="w-full" value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import</CardTitle>
                <CardDescription>
                  Discover and review multiple website URLs at once.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    bulkForm.handleSubmit()
                  }}
                >
                  <FieldGroup>
                    <bulkForm.Field name="url">
                      {(field) => (
                        <Field>
                          <FieldLabel>URL</FieldLabel>
                          <FieldDescription>
                            Enter the URL of the website you want to scan.
                          </FieldDescription>
                          <Input
                            id={field.name}
                            type="url"
                            name={field.name}
                            value={field.state.value}
                            placeholder="https://tanstack.com/start"
                            required
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            autoComplete="off"
                            disabled={isBulkPending}
                            aria-invalid={field.state.meta.errors.length > 0}
                          />
                          {field.state.meta.errors.length > 0 && (
                            <FieldError>
                              {field.state.meta.errors[0]?.message}
                            </FieldError>
                          )}
                        </Field>
                      )}
                    </bulkForm.Field>

                    <bulkForm.Field name="search">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          field.state.meta.errors.length > 0
                        return (
                          <Field>
                            <FieldLabel>Search</FieldLabel>
                            <FieldDescription>
                              Filter the discovered URLs with a keyword.
                            </FieldDescription>
                            <Input
                              id={field.name}
                              type="text"
                              name={field.name}
                              value={field.state.value}
                              placeholder="blog, docs, pricing"
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              onBlur={field.handleBlur}
                              autoComplete="off"
                              disabled={isBulkPending}
                              aria-invalid={field.state.meta.errors.length > 0}
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    </bulkForm.Field>

                    <Button type="submit" disabled={isBulkPending}>
                      {isBulkPending && !progress ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" /> Mapping...
                        </>
                      ) : (
                        'Map URLs'
                      )}
                    </Button>
                  </FieldGroup>
                </form>

                {/* Discovered Links */}
                {discoveredLinks.length > 0 ? (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {discoveredLinks.length}
                        </span>{' '}
                        URLs found
                        {selectedLinks.size > 0 && (
                          <span className="ml-1">
                            · {selectedLinks.size} selected
                          </span>
                        )}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={isBulkPending}
                      >
                        {selectedLinks.size === discoveredLinks.length
                          ? 'Deselect All'
                          : `Select All (${discoveredLinks.length})`}
                      </Button>
                    </div>

                    {/* Links List */}
                    <div className="max-h-80 overflow-y-auto rounded-md border">
                      {discoveredLinks.map((link) => (
                        <Label
                          key={link.url}
                          className="flex cursor-pointer items-start gap-3 border-b p-4 last:border-0 hover:bg-muted/50 has-checked:bg-primary/5"
                        >
                          <Checkbox
                            checked={selectedLinks.has(link.url ?? '')}
                            className="mt-1"
                            onCheckedChange={() =>
                              handleToggleUrl(link.url ?? '')
                            }
                            disabled={isBulkPending}
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
                      ))}
                    </div>

                    {/* Progress indicator — shown only during import */}
                    {isBulkPending && progress && (
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

                    {/* Scrape Selected Button */}
                    {selectedLinks.size > 0 && (
                      <Button
                        className="w-full"
                        onClick={handleBulkImport}
                        disabled={isBulkPending || selectedLinks.size === 0}
                      >
                        {isBulkPending ? (
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
                          `Scrape ${selectedLinks.size} URL${selectedLinks.size === 1 ? '' : 's'}`
                        )}
                      </Button>
                    )}
                  </div>
                ) : hasSearched && !isBulkPending ? (
                  <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-10 text-center">
                    <GlobeIcon className="mb-2 size-8 text-muted-foreground" />
                    <p className="text-sm font-medium">No URLs found</p>
                    <p className="text-xs text-muted-foreground">
                      Try a different URL or search keyword.
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
