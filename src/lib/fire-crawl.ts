import Firecrawl from '@mendable/firecrawl-js'

export const fireCrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY!,
})
