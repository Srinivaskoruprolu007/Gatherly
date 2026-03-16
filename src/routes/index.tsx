import { LandingPageTemplate } from '#/components/web/landing/template'
import { fetchHomePreviewFn, fetchLandingContentFn } from '#/data/landing-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
  staticData: { breadcrumb: 'Home' },
  loader: async () => {
    const [content, preview] = await Promise.all([
      fetchLandingContentFn(),
      fetchHomePreviewFn(),
    ])
    return { content, preview }
  },
})

function App() {
  const { content, preview } = Route.useLoaderData()

  return <LandingPageTemplate content={content} preview={preview} />
}
