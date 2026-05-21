import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { fetchSessionUser } from '#/lib/server/fns'
import { signOut } from '#/lib/auth-client'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await fetchSessionUser()
    if (!user) throw redirect({ to: '/sign-in' })
    return { user }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const { user } = Route.useRouteContext()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
              ♪
            </span>
            <span className="font-display text-lg font-semibold">
              StoryTunes
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted-foreground sm:inline">
              {user.email}
            </span>
            {user.role !== 'customer' && (
              <Link
                to="/admin"
                className="font-medium text-foreground hover:text-rose"
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
