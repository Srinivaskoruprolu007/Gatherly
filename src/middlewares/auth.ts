import { auth } from '#/lib/auth'
import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

// Used in createServerFn — always enforce authentication.
// Never bypass based on URL: the request URL here is the server
// function endpoint, not the page the user is currently on.
export const authFnMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw redirect({ to: '/auth/login' })
    }

    return next({ context: { session } })
  },
)

// Used for route-level guards.
export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const { pathname } = new URL(request.url)

    // Better Auth's own API routes — always pass through untouched.
    if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
      return next()
    }

    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    // Redirect authenticated users away from auth pages.
    if ((pathname === '/auth' || pathname.startsWith('/auth/')) && session) {
      throw redirect({ to: '/dashboard' })
    }

    // Protect dashboard routes and all other API routes.
    if (
      (pathname.startsWith('/dashboard') || pathname.startsWith('/api/ai')) &&
      !session
    ) {
      throw redirect({ to: '/auth/login' })
    }

    // Public routes (/, /auth/*, and anything else) fall through here.
    // session may be null for public routes — that's intentional.
    return next({ context: { session } })
  },
)
