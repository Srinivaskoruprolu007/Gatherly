import {
  CapabilitiesSection,
  CtaSection,
  HeroSection,
  LandingFooter,
  ProductStagesSection,
  SavedItemsSection,
  TestimonialSection,
  UseCasesSection,
  WorkflowSection,
} from '#/components/web/landing/organisms'
import type {
  LandingContentMap,
  LandingPreviewData,
} from '#/components/web/landing/types'
import Navbar from '#/components/web/navbar'
import { Separator } from '@/components/ui/separator'

type LandingPageTemplateProps = {
  content: LandingContentMap
  preview?: LandingPreviewData
}

export function LandingPageTemplate({
  content,
  preview,
}: LandingPageTemplateProps) {
  const hero = content.hero?.[0]
  const heroStats = content.hero_stat ?? []
  const productStages = content.product_stage ?? []
  const workflowIntro = content.workflow_intro?.[0]
  const workflow = content.workflow ?? []
  const capabilityIntro = content.capability_intro?.[0]
  const capabilityBullets = content.capability_bullet ?? []
  const features = content.feature ?? []
  const savedItemIntro = content.saved_item_intro?.[0]
  const savedItemDetails = content.saved_item_detail ?? []
  const useCaseIntro = content.use_case_intro?.[0]
  const useCases = content.use_case ?? []
  const testimonial = content.testimonial?.[0]
  const finalCta = content.final_cta?.[0]

  const isLoggedIn = Boolean(preview)
  const primaryCta =
    hero?.ctaPrimary ?? (isLoggedIn ? 'Open dashboard' : 'Get Started')
  const secondaryCta = hero?.ctaSecondary ?? 'See Product Flow'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top,rgba(48,120,102,0.22),transparent_58%)]" />
        <div className="absolute left-1/2 top-24 -z-10 h-96 w-[min(74rem,92vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.14),transparent_62%)] blur-3xl" />

        <HeroSection
          hero={hero}
          heroStats={heroStats}
          isLoggedIn={isLoggedIn}
          primaryCta={primaryCta}
          secondaryCta={secondaryCta}
          preview={preview}
        />
        <ProductStagesSection stages={productStages} />
        <WorkflowSection intro={workflowIntro} steps={workflow} />
        <CapabilitiesSection
          intro={capabilityIntro}
          bullets={capabilityBullets}
          features={features}
        />
        <SavedItemsSection intro={savedItemIntro} details={savedItemDetails} />
        <UseCasesSection intro={useCaseIntro} items={useCases} />
        <TestimonialSection testimonial={testimonial} />
        <CtaSection
          finalCta={finalCta}
          isLoggedIn={isLoggedIn}
          primaryCta={primaryCta}
        />
      </main>

      <Separator />
      <LandingFooter />
    </div>
  )
}
