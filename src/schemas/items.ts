import { ItemStatus } from '#/generated/prisma/enums'
import z from 'zod'

export const itemSearchSchema = z.object({
  q: z.string().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemStatus)]).default('all'),
  page: z.coerce.number().int().min(1).catch(1),
})
