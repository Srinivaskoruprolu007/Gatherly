import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  // Use the current origin so auth state stays aligned across local hosts.
})
