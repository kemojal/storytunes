import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchAdminOrders } from '#/lib/server/admin'
import { ORDER_STATUSES } from '#/lib/order/statuses'
import { StatusBadge } from '#/components/order/status'
import { formatUsd } from '#/lib/order/constants'

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/admin/orders"
          search={{}}
          className="rounded-full border px-3 py-1 text-xs hover:bg-accent [&.active]:bg-primary [&.active]:text-primary-foreground"
          activeOptions={{ exact: true, includeSearch: true }}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            to="/admin/orders"
            search={{ status: s }}
            className="rounded-full border px-3 py-1 text-xs hover:bg-accent [&.active]:bg-primary [&.active]:text-primary-foreground"
            activeOptions={{ includeSearch: true }}
          >
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      <div className="divide-y rounded-xl border">
        {orders.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No orders{status ? ` with status “${status}”` : ''}.
          </div>
        )}
        {orders.map((o) => (
          <Link
            key={o.id}
            to="/admin/orders/$orderId"
            params={{ orderId: o.id }}
            className="flex items-center justify-between px-5 py-4 hover:bg-accent"
          >
            <div>
              <div className="font-medium">
                {o.order_number} — {o.recipient_name}
              </div>
              <div className="text-xs text-muted-foreground">
                {o.occasion} · {o.package_type} · {formatUsd(o.price_cents)}
              </div>
            </div>
            <StatusBadge status={o.status} />
          </Link>
        ))}
      </div>
    </div>
  )
}
