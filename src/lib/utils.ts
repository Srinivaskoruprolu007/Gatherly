import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { authClient } from './auth-client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function handleSignOut(onSignedOut?: () => void | Promise<void>) {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        toast.success('Logged out successfully')
      },
      onError: ({ error }) => {
        toast.error(error.message)
      },
    },
  })
  await onSignedOut?.()
}
