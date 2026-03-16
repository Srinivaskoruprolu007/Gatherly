import { prisma } from '#/db'
import { mergeLandingContentWithDefaults } from '#/data/landing-page-content'
import { auth } from '#/lib/auth'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const fetchLandingContentFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const content = await prisma.landing_page_content.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    })

    return mergeLandingContentWithDefaults(content)
  },
)

export const fetchHomePreviewFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      return null
    }

    const items = await prisma.savedItems.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    })

    const [totalItems, processingItems, completedItems] = await Promise.all([
      prisma.savedItems.count({
        where: {
          userId: session.user.id,
        },
      }),
      prisma.savedItems.count({
        where: {
          userId: session.user.id,
          status: 'PROCESSING',
        },
      }),
      prisma.savedItems.count({
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
        },
      }),
    ])

    return {
      user: session.user,
      items,
      metrics: {
        totalItems,
        processingItems,
        completedItems,
      },
    }
  },
)
