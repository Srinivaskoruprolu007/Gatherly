export type RetryOptions = {
  retries?: number
  minDelayMs?: number
  maxDelayMs?: number
  factor?: number
  jitter?: boolean
  retryIf?: (error: unknown, attempt: number) => boolean
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  retries: 3,
  minDelayMs: 250,
  maxDelayMs: 5000,
  factor: 2,
  jitter: true,
  retryIf: () => true,
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getDelay(attempt: number, options: Required<RetryOptions>) {
  const baseDelay = options.minDelayMs * options.factor ** (attempt - 1)
  const capped = Math.min(options.maxDelayMs, baseDelay)

  if (!options.jitter) {
    return capped
  }

  const jitterFraction = 0.5 + Math.random() * 0.5
  return Math.round(capped * jitterFraction)
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const merged = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let attempt = 0

  while (true) {
    try {
      return await fn()
    } catch (error) {
      attempt += 1

      const shouldRetry =
        attempt <= merged.retries && merged.retryIf(error, attempt)

      if (!shouldRetry) {
        throw error
      }

      const delay = getDelay(attempt, merged)
      await wait(delay)
    }
  }
}
