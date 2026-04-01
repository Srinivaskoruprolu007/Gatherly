export type AppErrorOptions = {
  message?: string
  statusCode?: number
  code?: string
  publicMessage?: string
  details?: unknown
}

export class AppError extends Error {
  public statusCode: number
  public code: string
  public publicMessage: string
  public details?: unknown

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = 'AppError'
    this.statusCode = options.statusCode ?? 500
    this.code = options.code ?? 'APP_ERROR'
    this.publicMessage =
      options.publicMessage ?? 'Something went wrong. Please try again later.'
    this.details = options.details

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  static from(error: unknown, options: AppErrorOptions = {}) {
    if (error instanceof AppError) {
      return error
    }

    const message =
      options.message ||
      (error instanceof Error ? error.message : 'Unexpected error')

    return new AppError(message, {
      statusCode: options.statusCode ?? 500,
      code: options.code ?? 'APP_ERROR',
      publicMessage:
        options.publicMessage ??
        (error instanceof AppError
          ? error.publicMessage
          : 'Something went wrong. Please try again later.'),
      details:
        options.details ??
        (error instanceof Error ? error.stack : 'No error details available.'),
    })
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function toJsonErrorResponse(error: unknown) {
  const appError = AppError.from(error)
  console.error(appError)

  return new Response(
    JSON.stringify({
      error: appError.publicMessage,
      code: appError.code,
    }),
    {
      status: appError.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
