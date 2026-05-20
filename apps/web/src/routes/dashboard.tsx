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
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="font-semibold">
            StoryTunes
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{user.email}</span>
            {user.role !== 'customer' && (
              <Link to="/admin" className="text-primary hover:underline">
                Admin
              </Link>
            )}
            <button onClick={() => signOut()} className="text-muted-foreground hover:underline">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
