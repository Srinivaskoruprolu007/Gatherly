import type { fetchHomePreviewFn } from '#/data/landing-page'

export type LandingContentItem = {
  slug?: string | null
  title?: string | null
  subtitle?: string | null
  description?: string | null
  icon?: string | null
  ctaPrimary?: string | null
  ctaSecondary?: string | null
}

export type LandingContentMap = Partial<Record<string, LandingContentItem[]>>

export type LandingPreviewData = Awaited<ReturnType<typeof fetchHomePreviewFn>>

export type LandingPreview = NonNullable<LandingPreviewData>
