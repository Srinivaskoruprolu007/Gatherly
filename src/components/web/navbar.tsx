import { authClient } from '#/lib/auth-client'
import { handleSignOut } from '#/lib/utils'
import { Link, useRouter } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Button, buttonVariants } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { ThemeSwitcher } from '../ui/theme-switcher'

function NavActions({
  session,
  isPending,
  onClose,
}: {
  session: ReturnType<typeof authClient.useSession>['data']
  isPending: boolean
  onClose?: () => void
}) {
  const router = useRouter()
  const [isSigningOut, startTransition] = useTransition()

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    )
  }

  if (session) {
    return (
      <>
        <Link to="/dashboard" className={buttonVariants()} onClick={onClose}>
          Dashboard
        </Link>
        <Button
          disabled={isSigningOut}
          onClick={() => {
            startTransition(async () => {
              await handleSignOut(async () => {
                onClose?.()
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
      <Link
        to="/auth/login"
        className={buttonVariants({ variant: 'outline' })}
        onClick={onClose}
      >
        Login
      </Link>
      <Link to="/auth/signup" className={buttonVariants()} onClick={onClose}>
        Get Started
      </Link>
    </>
  )
}

const Navbar = () => {
  const { data: session, isPending } = authClient.useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-backdrop-blur:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/djuvtohxk/image/upload/v1773383518/Gatherly_Logo_lcgt1a.webp"
            alt="Gatherly logo"
            className="size-8 rounded-sm object-contain"
          />
          <span className="text-lg font-semibold tracking-tight">Gatherly</span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          <ThemeSwitcher />
          <NavActions session={session} isPending={isPending} />
        </div>

        {/* Mobile: theme switcher + hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-background/95 px-4 pb-4 pt-3 sm:hidden">
          <div className="flex flex-col gap-2">
            <NavActions
              session={session}
              isPending={isPending}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
