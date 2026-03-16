# Gatherly

> A modern full-stack web application built with TanStack Start and React.

[![Live Demo](https://img.shields.io/badge/Live-gatherly--bice.vercel.app-blue?style=flat-square)](https://gatherly-bice.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-99%25-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

---

## Tech Stack

| Layer         | Technology                                                  |
| ------------- | ----------------------------------------------------------- |
| Framework     | [TanStack Start](https://tanstack.com/start)                |
| Routing       | [TanStack Router](https://tanstack.com/router) (file-based) |
| Forms         | [TanStack Form](https://tanstack.com/form)                  |
| Auth          | [Better Auth](https://better-auth.com)                      |
| UI Components | [shadcn/ui](https://ui.shadcn.com)                          |
| Styling       | [Tailwind CSS v4](https://tailwindcss.com)                  |
| Database ORM  | [Prisma](https://prisma.io)                                 |
| Notifications | [Sonner](https://sonner.emilkowal.ski)                      |
| Analytics     | [Vercel Analytics](https://vercel.com/analytics)            |
| Language      | TypeScript                                                  |

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

Create a `.env` file in the root and fill in your values:

```env
DATABASE_URL=your_postgresql_connection_string
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
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
├── routes/           # File-based routes (TanStack Router)
│   ├── __root.tsx    # Root layout with head, theme, toaster
│   └── ...
├── components/       # Shared UI components (shadcn/ui)
├── context/          # React context providers (ThemeContext, etc.)
├── lib/              # Utilities and constants
└── styles.css        # Global styles (Tailwind)

prisma/
└── schema.prisma     # Database schema
```

---

## Features

- **SSR** — Server-side rendered with TanStack Start
- **File-based Routing** — Automatic route generation from `src/routes/`
- **Auth** — Session-based authentication via Better Auth
- **Dark / Light Theme** — Runtime theme switching with no flash on load
- **Type-safe** — End-to-end TypeScript with strict configuration
- **Analytics** — Page view tracking via Vercel Analytics

---

## Deployment

This app is deployed on **Vercel**. Every push to `main` triggers a production deployment automatically.

Live URL: [https://gatherly-bice.vercel.app](https://gatherly-bice.vercel.app)

---

## License

MIT License

Copyright (c) 2026 Srinivaskoruprolu007
