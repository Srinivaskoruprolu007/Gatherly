import { authClient } from '#/lib/auth-client'
import { handleSignOut } from '#/lib/utils'
import { Link, useRouter } from '@tanstack/react-router'
import { Button, buttonVariants } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { ThemeSwitcher } from '../ui/theme-switcher'
import { useTransition } from 'react'

function NavActions({
  session,
  isPending,
}: {
  session: ReturnType<typeof authClient.useSession>['data']
  isPending: boolean
}) {
  const router = useRouter()
  const [isSigningOut, startTransition] = useTransition()
  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    )
  }
  if (session) {
    return (
      <>
        <Link to="/dashboard" className={buttonVariants()}>
          Dashboard
        </Link>

        <Button
          disabled={isSigningOut}
          onClick={() => {
            startTransition(async () => {
              await handleSignOut(async () => {
                await router.invalidate()
                await router.navigate({ to: '/' })
              })
            })
          }}
        >
          {isSigningOut ? 'Logging out...' : 'Logout'}
        </Button>
      </>
    )
  }

  return (
    <>
      <Link to="/auth/login" className={buttonVariants()}>
        Login
      </Link>
      <Link
        to="/auth/signup"
        className={buttonVariants({ variant: 'outline' })}
      >
        Get Started
      </Link>
    </>
  )
}
const Navbar = () => {
  const { data: session, isPending } = authClient.useSession()
  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-backdrop-blur:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img
              src="https://res.cloudinary.com/djuvtohxk/image/upload/v1773383518/Gatherly_Logo_lcgt1a.webp"
              alt="Gatherly logo"
              className="size-9 rounded-sm object-contain"
            />
          </Link>
          <h1 className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">
            Gatherly
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSwitcher />
          <NavActions session={session} isPending={isPending} />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
