# Gatherly

> A personal knowledge capture tool that turns any webpage into structured, searchable content — saved to your own library.

[![Live Demo](https://img.shields.io/badge/Live-gatherly--bice.vercel.app-blue?style=flat-square)](https://gatherly-bice.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-99%25-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

---

## What is Gatherly?

Gatherly is a **personal knowledge library**. Paste any URL and Gatherly automatically fetches the page, strips away noise (ads, nav, clutter), and stores the content as clean Markdown — with metadata like title, author, publish date, and OG image. It then uses AI to summarize the content and tag it automatically, so your saved pages become a searchable, structured knowledge archive scoped privately to your account.

---

## Features

### 🔗 Intelligent Web Capture

Save any webpage by providing a URL. The system fetches and processes the page content automatically.

### 🧹 Smart Content Extraction

Web pages are cleaned and converted into structured Markdown, removing ads, navigation clutter, and noise.

### 🏷️ Metadata Extraction

Automatically extracts useful metadata from each page:

- Title
- Author
- Published date
- Open Graph image

### 🤖 AI Summarization

Each saved page is automatically summarized using AI, giving you a concise overview of the content without having to re-read the full article.

### 🏷️ Auto-Generated Tags

AI analyzes the content of each saved page and automatically assigns relevant tags, making your library self-organizing and easy to browse by topic.

### 🔭 Discover by Topic

Use the **Discover** route to fetch a curated set of links for any topic of interest. Explore new content and add it directly to your knowledge library without manually hunting for URLs.

### 📦 Bulk URL Import

Import multiple URLs at once and process them in parallel for faster knowledge capture.

### 🗺️ Site Mapping

Discover multiple pages from a website automatically — useful for exploring documentation, blogs, and research sources.

### 📊 Content Status Tracking

Each saved page moves through a transparent processing lifecycle:

| Status       | Description                               |
| ------------ | ----------------------------------------- |
| `processing` | Page is being fetched and parsed          |
| `completed`  | Content successfully extracted and stored |
| `failed`     | An error occurred during capture          |

### 📚 Structured Knowledge Storage

Captured pages are stored as structured records in the database — searchable, revisitable, and reusable.

### 📝 Clean Markdown Output

All captured content is stored as Markdown, making it easy to render in apps, export, or reuse in docs and notes.

### 🔐 Authentication & User Isolation

Each user's saved content is securely scoped to their account via Better Auth.

### ⚡ Fast Server Functions

Built with TanStack Start server functions for type-safe, fast server-side operations.

### 🔍 SEO-Friendly Landing Page

Landing page content is rendered server-side, producing fully hydrated HTML for search engines.

---

## Tech Stack

| Layer                        | Technology                                                  |
| ---------------------------- | ----------------------------------------------------------- |
| Framework                    | [TanStack Start](https://tanstack.com/start)                |
| Routing                      | [TanStack Router](https://tanstack.com/router) (file-based) |
| Forms                        | [TanStack Form](https://tanstack.com/form)                  |
| Auth                         | [Better Auth](https://better-auth.com)                      |
| Database ORM                 | [Prisma](https://prisma.io)                                 |
| Database                     | [Neon PostgreSQL](https://neon.tech)                        |
| Web Scraping                 | [Firecrawl API](https://firecrawl.dev)                      |
| AI (Summarization & Tagging) | Claude / OpenAI                                             |
| Validation                   | [Zod](https://zod.dev)                                      |
| UI Components                | [shadcn/ui](https://ui.shadcn.com)                          |
| Styling                      | [Tailwind CSS v4](https://tailwindcss.com)                  |
| Notifications                | [Sonner](https://sonner.emilkowal.ski)                      |
| Analytics                    | [Vercel Analytics](https://vercel.com/analytics)            |
| Language                     | TypeScript                                                  |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
git clone https://github.com/Srinivaskoruprolu007/Gatherly.git
cd Gatherly
pnpm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=your_neon_postgresql_connection_string

BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000

FIRECRAWL_API_KEY=your_firecrawl_api_key

# AI provider (whichever you use)
ANTHROPIC_API_KEY=your_anthropic_api_key
# or
OPENAI_API_KEY=your_openai_api_key
```

### Development

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

---

## Scripts

| Command       | Description                                 |
| ------------- | ------------------------------------------- |
| `pnpm dev`    | Start development server                    |
| `pnpm build`  | Build for production                        |
| `pnpm start`  | Start production server                     |
| `pnpm test`   | Run tests with [Vitest](https://vitest.dev) |
| `pnpm lint`   | Lint with ESLint                            |
| `pnpm format` | Format with Prettier                        |
| `pnpm check`  | Run lint + format check together            |

---

## Project Structure

```
src/
├── routes/             # File-based routes (TanStack Router)
│   ├── __root.tsx      # Root layout — head, theme, toaster, analytics
│   ├── _authed/        # Authenticated route group
│   │   ├── discover/   # Topic-based link discovery
│   │   └── ...
│   └── ...
├── components/         # Shared UI components (shadcn/ui)
├── context/            # React context providers (ThemeContext)
├── lib/                # Utilities, constants, server functions
└── styles.css          # Global styles (Tailwind)

prisma/
└── schema.prisma       # Database schema (Neon PostgreSQL)
```

---

## Architecture

Gatherly separates concerns into distinct layers:

```
URL Input
    │
    ▼
Firecrawl API          ← fetch, clean, extract metadata
    │
    ▼
AI Pipeline            ← summarize content, auto-generate tags
    │
    ▼
Prisma / Neon          ← store structured records
    │
    ▼
UI (TanStack Router)   ← render, search, discover
```

This separation allows the platform to grow into a full knowledge management system — with search, filtering by tag, export, and more.

---

## Deployment

Deployed on **Vercel** with automatic deployments on every push to `main`.

🔗 [https://gatherly-bice.vercel.app](https://gatherly-bice.vercel.app)

---

## License

MIT
