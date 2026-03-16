import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../src/generated/prisma/client.js'
import { defaultLandingPageContentRows } from '../src/data/landing-page-content.ts'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function seedLandingPageContent() {
  const existingRows = await prisma.landing_page_content.findMany({
    select: {
      section: true,
    },
  })

  const existingSections = new Set(existingRows.map((row) => row.section))

  const missingRows = defaultLandingPageContentRows.filter(
    (row) => !existingSections.has(row.section),
  )

  if (missingRows.length === 0) {
    console.info('Landing page content is already up to date.')
    return
  }

  await prisma.landing_page_content.createMany({
    data: missingRows,
  })

  console.info(`Seeded ${missingRows.length} missing landing content row(s).`)
}

async function main() {
  await seedLandingPageContent()
}

main()
  .catch((error) => {
    console.error('Unable to seed landing page content.', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
