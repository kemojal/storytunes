import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchAdminOrders } from '#/lib/server/admin'
import { ORDER_STATUSES } from '#/lib/order/statuses'
import { StatusBadge } from '#/components/order/status'
import { formatUsd, titleCase } from '#/lib/order/constants'

type Search = { status?: string }

export const Route = createFileRoute('/admin/orders')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    status: typeof s.status === 'string' ? s.status : undefined,
  }),
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: ({ deps }) => fetchAdminOrders({ data: deps.status }),
  component: AdminOrders,
})

function AdminOrders() {
  const orders = Route.useLoaderData()
  const { status } = Route.useSearch()

  const chip =
    'rounded-full border border-border/60 px-3 py-1 text-xs capitalize transition-colors hover:border-gold/50 hover:bg-accent [&.active]:border-primary [&.active]:bg-primary [&.active]:text-primary-foreground'

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-2xl">Orders</h1>
        <span className="text-sm text-muted-foreground">
          {orders.length} shown
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Link
          to="/admin/orders"
          search={{}}
          className={chip}
          activeOptions={{ exact: true, includeSearch: true }}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            to="/admin/orders"
            search={{ status: s }}
            className={chip}
            activeOptions={{ includeSearch: true }}
          >
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-soft">
        {orders.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            No orders
            {status ? ` with status “${status.replace(/_/g, ' ')}”` : ''}.
          </div>
        )}
        {orders.map((o) => (
          <Link
            key={o.id}
            to="/admin/orders/$orderId"
            params={{ orderId: o.id }}
            className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-accent/50"
          >
            <div className="min-w-0">
              <div className="truncate font-medium">
                {o.recipient_name}{' '}
                <span className="font-normal text-muted-foreground">
                  · {o.order_number}
                </span>
              </div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                {titleCase(o.occasion)} · {titleCase(o.package_type)} ·{' '}
                {formatUsd(o.price_cents)}
              </div>
            </div>
            <StatusBadge status={o.status} />
          </Link>
        ))}
      </div>
    </div>
  )
}
