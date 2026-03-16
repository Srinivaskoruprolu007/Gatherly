import type { itemSearchSchema } from '#/schemas/items'
import type { User } from 'better-auth'
import type { LucideIcon } from 'lucide-react'
import type z from 'zod'

export interface NavPrimaryProps {
  projects: {
    title: string
    to: string
    icon: LucideIcon
    activeOptions: {
      exact: boolean
    }
  }[]
}

export interface NavUserProps {
  user: User
}

export type ItemSearch = z.infer<typeof itemSearchSchema>
