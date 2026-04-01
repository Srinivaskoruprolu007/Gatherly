'use client'

import { buttonVariants } from '#/components/ui/button'
import * as React from 'react'

export default class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      'Unhandled error caught by AppErrorBoundary:',
      error,
      errorInfo,
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <h1 className="text-3xl font-semibold text-red-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm leading-6 text-red-700">
              We couldn’t load this part of the app. Refresh the page or try
              again in a few moments.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error ? (
              <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 text-left text-xs text-slate-100">
                {this.state.error?.message}
              </pre>
            ) : null}
            <button
              type="button"
              className={`${buttonVariants()} mt-6`}
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
