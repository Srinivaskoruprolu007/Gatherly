import { bulkImportSchema, importSchema } from '#/schemas/import'
import { createServerFn } from '@tanstack/react-start'

type ServerFieldError = {
  message: string
}

type ImportValidationResult<TFields extends Record<string, unknown>> =
  | { success: true }
  | {
      success: false
      form?: ServerFieldError
      fields: Partial<{ [K in keyof TFields]: ServerFieldError }>
    }

export const validateSingleImportFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => importSchema.parse(data))
  .handler(async ({ data }): Promise<ImportValidationResult<typeof data>> => {
    const url = new URL(data.url)

    if (url.protocol !== 'https:') {
      return {
        success: false,
        fields: {
          url: { message: 'Only HTTPS URLs are allowed.' },
        },
      }
    }

    return { success: true }
  })

export const validateBulkImportFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => bulkImportSchema.parse(data))
  .handler(async ({ data }): Promise<ImportValidationResult<typeof data>> => {
    const url = new URL(data.url)
    const search = data.search.trim()

    if (url.protocol !== 'https:') {
      return {
        success: false,
        fields: {
          url: { message: 'Only HTTPS URLs are allowed.' },
        },
      }
    }

    if (search.length < 3) {
      return {
        success: false,
        fields: {
          search: { message: 'Search must be at least 3 characters long.' },
        },
      }
    }

    return { success: true }
  })
