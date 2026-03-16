import {
  FlowPill,
  InsightStat,
  Metric,
  PreviewRow,
} from '#/components/web/landing/atoms'
import {
  FeatureBullet,
  FeatureCard,
  MetricCard,
  SignalCard,
  StageCard,
} from '#/components/web/landing/molecules'
import type {
  LandingContentItem,
  LandingPreview,
  LandingPreviewData,
} from '#/components/web/landing/types'
import { getContentIcon } from '#/components/web/landing/utils'
import { authClient } from '#/lib/auth-client'
import { cn } from '#/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Bookmark,
  Brain,
  Clock3,
  ExternalLink,
  Globe,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react'

type HeroSectionProps = {
  hero?: LandingContentItem
  heroStats: LandingContentItem[]
  isLoggedIn: boolean
  primaryCta: string
  secondaryCta: string
  preview?: LandingPreviewData
}

export function HeroSection({
  hero,
  heroStats,
  isLoggedIn,
  primaryCta,
  secondaryCta,
  preview,
}: HeroSectionProps) {
  return (
    <section className="px-6 pb-18 pt-16 md:pb-24 md:pt-22">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-start gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="secondary" className="rounded-full px-4 py-1">
              {hero?.description ?? 'Search. Capture. Summarize. Revisit.'}
            </Badge>

            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              {hero?.title ??
                'Build a knowledge library from the web, not a graveyard of forgotten tabs.'}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              {hero?.subtitle ??
                'Gatherly helps you discover useful pages, import them into a clean library, generate summaries and tags, and come back to the signal when it matters.'}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2 rounded-full px-6">
                <Link to={isLoggedIn ? '/dashboard/discover' : '/auth/signup'}>
                  {primaryCta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-6"
              >
                <a href="#workflow">{secondaryCta}</a>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <InsightStat
                  key={stat.slug ?? stat.title}
                  value={stat.title ?? ''}
                  label={stat.subtitle ?? ''}
                  description={stat.description ?? ''}
                />
              ))}
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            {isLoggedIn && preview ? (
              <LiveDashboardPreview preview={preview} />
            ) : (
              <MarketingPreview />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

type ProductStagesSectionProps = {
  stages: LandingContentItem[]
}

export function ProductStagesSection({ stages }: ProductStagesSectionProps) {
  return (
    <section className="px-6 pb-10">
      <div className="mx-auto max-w-6xl">
        <Card className="overflow-hidden border-border/70 bg-card/70 shadow-xl">
          <CardContent className="p-0">
            <div className="grid gap-px bg-border/60 lg:grid-cols-4">
              {stages.map((stage) => (
                <StageCard
                  key={stage.slug ?? stage.title}
                  eyebrow={stage.subtitle ?? ''}
                  title={stage.title ?? ''}
                  description={stage.description ?? ''}
                  icon={getContentIcon(stage.icon)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

type WorkflowSectionProps = {
  intro?: LandingContentItem
  steps: LandingContentItem[]
}

export function WorkflowSection({ intro, steps }: WorkflowSectionProps) {
  return (
    <section className="border-y border-border/60 bg-muted/25 px-6 py-22">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Badge variant="outline" className="rounded-full">
              {intro?.subtitle ?? 'Product flow'}
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              {intro?.title ?? 'Designed around how the app actually works'}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {intro?.description ??
              'Discover helps users find pages, Import captures them, item pages add AI context, and the library makes those sources easy to revisit.'}
          </p>
        </div>

        <div id="workflow" className="mt-14 grid gap-5 lg:grid-cols-2">
          {steps.map((step, index) => (
            <Card
              key={step.slug ?? step.title ?? String(index)}
              className="border-border/70 bg-background/80 shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

type CapabilitiesSectionProps = {
  intro?: LandingContentItem
  bullets: LandingContentItem[]
  features: LandingContentItem[]
}

export function CapabilitiesSection({
  intro,
  bullets,
  features,
}: CapabilitiesSectionProps) {
  return (
    <section className="px-6 py-22">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge variant="outline" className="rounded-full">
            {intro?.subtitle ?? 'Core capabilities'}
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            {intro?.title ??
              'The landing page now reflects the real outcome of the product'}
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {intro?.description ??
              'Gatherly is more than scraping. It turns scattered source pages into a reusable library with context, summaries, tags, and search-ready structure.'}
          </p>

          <div className="mt-8 space-y-3">
            {bullets.map((bullet) => (
              <FeatureBullet
                key={bullet.slug ?? bullet.description}
                icon={getContentIcon(bullet.icon)}
                text={bullet.description ?? ''}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard
              key={feature.slug ?? feature.title}
              icon={getContentIcon(feature.icon)}
              title={feature.title ?? ''}
              description={feature.description ?? ''}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

type SavedItemsSectionProps = {
  intro?: LandingContentItem
  details: LandingContentItem[]
}

export function SavedItemsSection({ intro, details }: SavedItemsSectionProps) {
  return (
    <section className="border-y border-border/60 bg-muted/25 px-6 py-22">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge variant="outline" className="rounded-full">
              {intro?.subtitle ?? 'What gets saved'}
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              {intro?.title ??
                'A lightweight research workspace, not only a scraper'}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {intro?.description ??
                'The saved item is the core concept of the app. It combines the source, the readable content, and the AI-generated context into one place.'}
            </p>
          </div>

          <Card className="overflow-hidden border-border/70 bg-background/80 shadow-xl">
            <CardContent className="grid gap-px bg-border/60 p-0 md:grid-cols-2">
              {details.map((detail) => (
                <SignalCard
                  key={detail.slug ?? detail.title}
                  icon={getContentIcon(detail.icon)}
                  title={detail.title ?? ''}
                  description={detail.description ?? ''}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

type UseCasesSectionProps = {
  intro?: LandingContentItem
  items: LandingContentItem[]
}

export function UseCasesSection({ intro, items }: UseCasesSectionProps) {
  return (
    <section className="px-6 py-22">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="outline" className="rounded-full">
              {intro?.subtitle ?? 'Use cases'}
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              {intro?.title ??
                'Useful for researchers, learners, and people who save too many links'}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {intro?.description ??
              'The new home page leans into clear outcomes instead of generic feature listing, which makes the product feel more focused.'}
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => (
            <Card
              key={item.slug ?? item.title}
              className={cn(
                'border-border/70 bg-card/80 shadow-sm',
                index === 0 && 'xl:col-span-2',
              )}
            >
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

type TestimonialSectionProps = {
  testimonial?: LandingContentItem
}

export function TestimonialSection({ testimonial }: TestimonialSectionProps) {
  return (
    <section className="px-6 py-22">
      <div className="mx-auto max-w-4xl">
        <Card className="overflow-hidden border-border/70 bg-card/85 shadow-xl">
          <CardContent className="relative p-8 md:p-10">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
            <Badge variant="secondary" className="rounded-full">
              {testimonial?.title ?? 'Product promise'}
            </Badge>
            <p className="mt-6 text-2xl font-medium leading-10 tracking-tight text-foreground/95 md:text-3xl md:leading-12">
              "
              {testimonial?.description ??
                'Instead of losing pages across tabs, history, and bookmarks, I get a saved library with structure, summaries, and context.'}
              "
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.24em] text-muted-foreground">
              {testimonial?.subtitle ?? 'Independent researcher'}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

type CtaSectionProps = {
  finalCta?: LandingContentItem
  isLoggedIn: boolean
  primaryCta: string
}

export function CtaSection({
  finalCta,
  isLoggedIn,
  primaryCta,
}: CtaSectionProps) {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-6xl rounded-4xl border border-border/70 bg-[linear-gradient(135deg,rgba(24,86,66,0.16),rgba(245,158,11,0.08),transparent)] p-2 shadow-2xl">
        <Card className="border-border/70 bg-background/94 shadow-none">
          <CardContent className="flex flex-col gap-8 p-8 md:p-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="rounded-full">
                {finalCta?.subtitle ?? 'Ready to use'}
              </Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
                {finalCta?.title ??
                  'Start with saved sources. Let intelligence layer on top.'}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {finalCta?.description ??
                  'Use Discover and Import to build the library first, then make it more valuable with summaries, tags, and a cleaner retrieval workflow.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2 rounded-full px-6">
                <Link to={isLoggedIn ? '/dashboard/import' : '/auth/signup'}>
                  {finalCta?.ctaPrimary ?? primaryCta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-6"
              >
                <Link to={isLoggedIn ? '/dashboard/items' : '/auth/login'}>
                  {isLoggedIn
                    ? 'View Library'
                    : (finalCta?.ctaSecondary ?? 'Login')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export function LandingFooter() {
  const { data: session } = authClient.useSession()
  const isLoggedIn = !!session?.user

  return (
    <footer className="px-6 py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span>© 2026 Gatherly. All rights reserved.</span>
          <span className="text-xs">
            Crafted with ♥ by{' '}
            <a
              href="https://github.com/Srinivaskoruprolu007"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Srinivas
            </a>
          </span>
        </div>

        <div className="flex gap-6">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <button
                onClick={() => authClient.signOut()}
                className="transition-colors hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="transition-colors hover:text-foreground"
              >
                Login
              </Link>
              <Link
                to="/auth/signup"
                className="transition-colors hover:text-foreground"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </footer>
  )
}

function MarketingPreview() {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/85 shadow-2xl backdrop-blur-sm">
      <CardContent className="p-5 md:p-6">
        <div className="rounded-[1.75rem] border border-border/70 bg-background/90 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <p className="text-sm font-medium">Workspace preview</p>
              <p className="text-xs text-muted-foreground">
                What new users should understand immediately
              </p>
            </div>
            <Badge className="gap-1.5 rounded-full">
              <Sparkles className="size-3" />
              Live flow
            </Badge>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <FlowPill icon={Search} label="Discover" detail="Topic search" />
              <FlowPill icon={Globe} label="Import" detail="Clean capture" />
              <FlowPill icon={Brain} label="Summarize" detail="AI context" />
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Selected source
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    https://signals.example.com/ai-market-map
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The app captures the article, metadata, and reference
                    context instead of leaving it buried in bookmarks.
                  </p>
                </div>
                <Badge className="rounded-full">Completed</Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Saved context
                </p>
                <div className="mt-4 space-y-3">
                  <Metric label="Readable article body" value="Included" />
                  <Metric label="Author and date" value="Captured" />
                  <Metric label="Summary and tags" value="Generated" />
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Library outcomes
                </p>
                <div className="mt-4 space-y-3">
                  <Metric label="Search later" value="Faster" />
                  <Metric label="Revisit sources" value="Simpler" />
                  <Metric label="Knowledge drift" value="Lower" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Why it matters
              </p>
              <div className="mt-4 space-y-3">
                <PreviewRow
                  icon={Search}
                  title="Find high-signal pages"
                  description="Use topic search to shortlist content before importing it."
                />
                <PreviewRow
                  icon={Bookmark}
                  title="Save structured records"
                  description="Each imported page becomes a reusable item with readable content and source data."
                />
                <PreviewRow
                  icon={Tag}
                  title="Retrieve by context"
                  description="Summaries and tags make long-term recall much easier."
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LiveDashboardPreview({ preview }: { preview: LandingPreview }) {
  const latestItem = preview.items.at(0)
  const hasItems = preview.items.length > 0

  return (
    <Card className="overflow-hidden border-border/70 bg-card/85 shadow-2xl backdrop-blur-sm">
      <CardContent className="p-5 md:p-6">
        <div className="rounded-[1.75rem] border border-border/70 bg-background/90 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <p className="text-sm font-medium">Your workspace</p>
              <p className="text-xs text-muted-foreground">
                Live preview from your imported items
              </p>
            </div>
            <Badge className="gap-1.5 rounded-full">
              <Sparkles className="size-3" />
              {preview.user.name}
            </Badge>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <FlowPill
                icon={Search}
                label="Discover"
                detail="Find new pages"
              />
              <FlowPill
                icon={Globe}
                label="Import"
                detail="Save source records"
              />
              <FlowPill
                icon={Brain}
                label="Summarize"
                detail="Tag and revisit"
              />
            </div>

            {latestItem ? (
              <Link
                to="/dashboard/items/$itemId"
                params={{ itemId: latestItem.id }}
                className="block"
              >
                <div className="rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:bg-accent/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Globe className="size-4" />
                        <span className="text-sm font-medium">
                          Latest import
                        </span>
                      </div>
                      <p className="line-clamp-1 text-sm font-medium">
                        {latestItem.title ?? latestItem.url}
                      </p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {latestItem.url}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className="rounded-full"
                        variant={
                          latestItem.status === 'COMPLETED'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {latestItem.status.toLowerCase()}
                      </Badge>
                      <ExternalLink className="mt-0.5 size-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Search className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Your library is empty</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Import your first URL to start building a searchable
                      archive of articles, docs, and references.
                    </p>
                    <Button asChild size="sm" className="mt-4 gap-2">
                      <Link to="/dashboard/import">
                        Import your first page
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Saved items"
                value={String(preview.metrics.totalItems)}
              />
              <MetricCard
                label="Completed"
                value={String(preview.metrics.completedItems)}
              />
              <MetricCard
                label="Processing"
                value={String(preview.metrics.processingItems)}
              />
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {hasItems ? 'Recent items' : 'How it fills up'}
                </p>
                {hasItems ? (
                  <Link
                    to="/dashboard/items"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View all
                    <ExternalLink className="size-3" />
                  </Link>
                ) : null}
              </div>
              <div className="mt-4 space-y-3">
                {hasItems ? (
                  preview.items.map((item) => (
                    <PreviewRow
                      key={item.id}
                      icon={item.status === 'COMPLETED' ? Bookmark : Clock3}
                      title={item.title ?? item.url}
                      description={item.author ?? item.url}
                      meta={item.status.toLowerCase()}
                    />
                  ))
                ) : (
                  <>
                    <PreviewRow
                      icon={Search}
                      title="Discover relevant pages"
                      description="Map a site and shortlist URLs worth saving."
                    />
                    <PreviewRow
                      icon={Bookmark}
                      title="Import clean content"
                      description="Each capture becomes a readable saved item with metadata."
                    />
                    <PreviewRow
                      icon={Tag}
                      title="Build a reusable archive"
                      description="Search, tag, and revisit the sources that matter most."
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
