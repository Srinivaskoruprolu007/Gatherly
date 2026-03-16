export type LandingPageContentRow = {
  section: string
  slug?: string | null
  title?: string | null
  subtitle?: string | null
  description?: string | null
  icon?: string | null
  ctaPrimary?: string | null
  ctaSecondary?: string | null
  displayOrder: number
}

export const defaultLandingPageContentRows: LandingPageContentRow[] = [
  {
    section: 'hero',
    slug: 'home',
    title: 'Build a knowledge library from the web, not a graveyard of forgotten tabs.',
    subtitle:
      'Gatherly helps you discover useful pages, import them into a clean library, generate summaries and tags, and come back to the signal when it matters.',
    description: 'Search. Capture. Summarize. Revisit.',
    ctaPrimary: 'Get Started',
    ctaSecondary: 'See Product Flow',
    displayOrder: 0,
  },
  {
    section: 'hero_stat',
    slug: 'discover',
    title: '01',
    subtitle: 'Discover by topic',
    description: 'Search the web before you save.',
    displayOrder: 0,
  },
  {
    section: 'hero_stat',
    slug: 'import',
    title: '02',
    subtitle: 'Import with structure',
    description: 'Store content and source metadata.',
    displayOrder: 1,
  },
  {
    section: 'hero_stat',
    slug: 'summarize',
    title: '03',
    subtitle: 'Summarize and tag',
    description: 'Recover context much faster later.',
    displayOrder: 2,
  },
  {
    section: 'product_stage',
    slug: 'discover',
    title: 'Search the web',
    subtitle: 'Discover',
    description:
      'Find relevant pages by topic before deciding what belongs in your saved library.',
    icon: 'search',
    displayOrder: 0,
  },
  {
    section: 'product_stage',
    slug: 'import',
    title: 'Capture source material',
    subtitle: 'Import',
    description:
      'Single URL scraping and bulk import convert raw links into clean, readable saved items.',
    icon: 'globe',
    displayOrder: 1,
  },
  {
    section: 'product_stage',
    slug: 'summarize',
    title: 'Add AI context',
    subtitle: 'Summarize',
    description:
      'Generate summaries and tags so each saved article stays easy to skim later.',
    icon: 'brain',
    displayOrder: 2,
  },
  {
    section: 'product_stage',
    slug: 'library',
    title: 'Revisit with confidence',
    subtitle: 'Library',
    description:
      'Filter by status, scan your archive, and jump back to the original source anytime.',
    icon: 'folder',
    displayOrder: 3,
  },
  {
    section: 'workflow_intro',
    slug: 'primary',
    title: 'Designed around how the app actually works',
    subtitle: 'Product flow',
    description:
      'Discover helps users find pages, Import captures them, item pages add AI context, and the library makes those sources easy to revisit.',
    displayOrder: 0,
  },
  {
    section: 'workflow',
    slug: 'step-1',
    title: 'Search by topic or map a site',
    description:
      'Use Discover to find articles by topic or Import to scan a source website for candidate pages.',
    displayOrder: 0,
  },
  {
    section: 'workflow',
    slug: 'step-2',
    title: 'Choose the pages worth keeping',
    description:
      'Review links, select only the useful ones, and skip importing low-signal content.',
    displayOrder: 1,
  },
  {
    section: 'workflow',
    slug: 'step-3',
    title: 'Save structured source records',
    description:
      'Each saved item keeps the URL, title, content, author, image, date, and processing state together.',
    displayOrder: 2,
  },
  {
    section: 'workflow',
    slug: 'step-4',
    title: 'Summarize, tag, and revisit',
    description:
      'Open item pages later, generate AI summaries, apply tags, and recover context faster.',
    displayOrder: 3,
  },
  {
    section: 'capability_intro',
    slug: 'primary',
    title: 'The landing page now reflects the real outcome of the product',
    subtitle: 'Core capabilities',
    description:
      'Gatherly is more than scraping. It turns scattered source pages into a reusable library with context, summaries, tags, and search-ready structure.',
    displayOrder: 0,
  },
  {
    section: 'capability_bullet',
    slug: 'single-and-bulk',
    description:
      'Single URL scrape and bulk import are both visible product strengths.',
    icon: 'check-circle-2',
    displayOrder: 0,
  },
  {
    section: 'capability_bullet',
    slug: 'discover-start',
    description:
      'Discover is positioned as the starting point for finding useful sources.',
    icon: 'check-circle-2',
    displayOrder: 1,
  },
  {
    section: 'capability_bullet',
    slug: 'ai-context',
    description:
      'Item detail pages are represented as the place where AI context gets added.',
    icon: 'check-circle-2',
    displayOrder: 2,
  },
  {
    section: 'feature',
    slug: 'discover',
    title: 'Discover relevant pages',
    description:
      'Search topics on the web and shortlist articles worth saving before your tabs turn into clutter.',
    icon: 'search',
    displayOrder: 0,
  },
  {
    section: 'feature',
    slug: 'import',
    title: 'Import clean content',
    description:
      'Capture readable article content, metadata, and source details as structured saved items.',
    icon: 'zap',
    displayOrder: 1,
  },
  {
    section: 'feature',
    slug: 'organize',
    title: 'Organize your library',
    description:
      'Track statuses, browse saved sources, and keep the useful pages together in one workspace.',
    icon: 'folder',
    displayOrder: 2,
  },
  {
    section: 'feature',
    slug: 'revisit',
    title: 'Revisit with context',
    description:
      'Generate summaries and tags so each saved source becomes easier to understand later.',
    icon: 'history',
    displayOrder: 3,
  },
  {
    section: 'saved_item_intro',
    slug: 'primary',
    title: 'A lightweight research workspace, not only a scraper',
    subtitle: 'What gets saved',
    description:
      'The saved item is the core concept of the app. It combines the source, the readable content, and the AI-generated context into one place.',
    displayOrder: 0,
  },
  {
    section: 'saved_item_detail',
    slug: 'metadata',
    title: 'Source metadata',
    description:
      'Keep title, URL, author, date, image, and status together for every page.',
    icon: 'globe',
    displayOrder: 0,
  },
  {
    section: 'saved_item_detail',
    slug: 'content',
    title: 'Readable content',
    description:
      'Store the main article body so useful pages are still readable after capture.',
    icon: 'file-text',
    displayOrder: 1,
  },
  {
    section: 'saved_item_detail',
    slug: 'summary',
    title: 'AI summary',
    description:
      'Generate concise summaries when returning to long articles later.',
    icon: 'wand-2',
    displayOrder: 2,
  },
  {
    section: 'saved_item_detail',
    slug: 'tags',
    title: 'Reusable tags',
    description:
      'Apply topic tags so the library becomes easier to scan and search.',
    icon: 'tag',
    displayOrder: 3,
  },
  {
    section: 'use_case_intro',
    slug: 'primary',
    title: 'Useful for researchers, learners, and people who save too many links',
    subtitle: 'Use cases',
    description:
      'The new home page leans into clear outcomes instead of generic feature listing, which makes the product feel more focused.',
    displayOrder: 0,
  },
  {
    section: 'use_case',
    slug: 'research',
    title: 'Research pipelines',
    description:
      'Collect reports, essays, and references without losing where they came from or why they mattered.',
    displayOrder: 0,
  },
  {
    section: 'use_case',
    slug: 'learning',
    title: 'Personal learning vault',
    description:
      'Turn scattered tutorials, docs, and articles into a library you can actually reuse.',
    displayOrder: 1,
  },
  {
    section: 'use_case',
    slug: 'content',
    title: 'Trend and content tracking',
    description:
      'Follow important topics across blogs and publications, then summarize the strongest sources.',
    displayOrder: 2,
  },
  {
    section: 'use_case',
    slug: 'teams',
    title: 'Knowledge groundwork',
    description:
      'Build toward a team-ready source repository with summaries, tags, and original references.',
    displayOrder: 3,
  },
  {
    section: 'testimonial',
    slug: 'primary',
    title: 'Product promise',
    subtitle: 'Independent researcher',
    description:
      'Instead of losing pages across tabs, history, and bookmarks, I get a saved library with structure, summaries, and context.',
    displayOrder: 0,
  },
  {
    section: 'final_cta',
    slug: 'primary',
    title: 'Start with saved sources. Let intelligence layer on top.',
    subtitle: 'Ready to use',
    description:
      'Use Discover and Import to build the library first, then make it more valuable with summaries, tags, and a cleaner retrieval workflow.',
    ctaPrimary: 'Get Started',
    ctaSecondary: 'Login',
    displayOrder: 0,
  },
]

type GroupedLandingContent<T extends { section: string }> = Partial<
  Record<string, T[]>
>

export function groupLandingContentBySection<T extends {
  section: string
  displayOrder: number
}>(rows: T[]): GroupedLandingContent<T> {
  return rows.reduce<GroupedLandingContent<T>>((acc, row) => {
    if (!acc[row.section]) {
      acc[row.section] = []
    }
    acc[row.section].push(row)
    acc[row.section].sort((a, b) => a.displayOrder - b.displayOrder)
    return acc
  }, {})
}

export function getDefaultLandingContent() {
  return groupLandingContentBySection(defaultLandingPageContentRows)
}

export function mergeLandingContentWithDefaults<
  T extends LandingPageContentRow & { section: string; displayOrder: number },
>(rows: T[]) {
  const defaults = getDefaultLandingContent()
  const fromDb = groupLandingContentBySection(rows)

  return {
    ...defaults,
    ...fromDb,
  }
}
