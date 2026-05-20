import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { fetchSessionUser } from '#/lib/server/fns'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const user = await fetchSessionUser()
    if (!user) throw redirect({ to: '/sign-in' })
    if (user.role === 'customer') throw redirect({ to: '/dashboard' })
    return { user }
  },
  component: AdminLayout,
})

const NAV = [
  { to: '/admin', label: 'Overview', exact: true },
  { to: '/admin/orders', label: 'Orders', exact: false },
  { to: '/admin/revisions', label: 'Revisions', exact: false },
  { to: '/admin/artists', label: 'Artists', exact: false },
  { to: '/admin/samples', label: 'Samples', exact: false },
] as const

function AdminLayout() {
  const { user } = Route.useRouteContext()
  return (
    <div className="min-h-screen">
      <header className="border-b bg-muted/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-semibold">
              StoryTunes Admin
            </Link>
            <nav className="flex gap-4 text-sm">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.exact ?? false }}
                  className="text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
