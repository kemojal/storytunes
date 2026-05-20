import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchAdminDashboard } from '#/lib/server/admin'
import { formatUsd } from '#/lib/order/constants'
import { humanizeStatus } from '#/components/order/status'

export const Route = createFileRoute('/admin/')({
  loader: () => fetchAdminDashboard(),
  component: Overview,
})

function Overview() {
  const stats = Route.useLoaderData()
  const cards = [
    { label: 'Total orders', value: String(stats.total_orders) },
    { label: 'Paid revenue', value: formatUsd(stats.revenue_cents) },
    { label: 'Open revisions', value: String(stats.open_revisions) },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border p-5">
            <div className="text-sm text-muted-foreground">{c.label}</div>
            <div className="mt-1 text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-medium">Orders by status</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.by_status).map(([status, count]) => (
            <Link
              key={status}
              to="/admin/orders"
              search={{ status }}
              className="rounded-full border px-3 py-1 text-sm hover:bg-accent"
            >
              {humanizeStatus(status)}: <b>{count}</b>
            </Link>
          ))}
          {Object.keys(stats.by_status).length === 0 && (
            <span className="text-sm text-muted-foreground">No orders yet.</span>
          )}
        </div>
      </div>
    </div>
  )
}
