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

  const icons = ['🎵', '💰', '✎']

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <span className="text-base opacity-70">{icons[i]}</span>
            </div>
            <div className="mt-2 font-display text-3xl">{c.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Orders by status
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.by_status).map(([status, count]) => (
            <Link
              key={status}
              to="/admin/orders"
              search={{ status }}
              className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-sm transition-colors hover:border-gold/50 hover:bg-accent"
            >
              {humanizeStatus(status)}
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {count}
              </span>
            </Link>
          ))}
          {Object.keys(stats.by_status).length === 0 && (
            <span className="text-sm text-muted-foreground">
              No orders yet.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
