import { buttonVariants } from '#/components/ui/button'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/auth')({
  component: Auth,
})

export function Auth() {
  return (
    <div className="min-h-screen">
      <div className="absolute top-8 left-8">
        <Link to="/" className={buttonVariants()}>
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
      <div className="min-h-screen flex justify-center items-center">
        <Outlet />
      </div>
    </div>
  )
}
