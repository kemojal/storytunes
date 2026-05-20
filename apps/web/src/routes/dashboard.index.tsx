import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchMyOrders } from '#/lib/server/fns'
import { formatUsd } from '#/lib/order/constants'
import { StatusBadge } from '#/components/order/status'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/dashboard/')({
  loader: () => fetchMyOrders(),
  component: MyOrders,
})

function MyOrders() {
  const orders = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My orders</h1>
        <Button asChild>
          <Link to="/order">New song</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border p-10 text-center text-muted-foreground">
          No orders yet.{' '}
          <Link to="/order" className="text-primary hover:underline">
            Create your first song
          </Link>
          .
        </div>
      ) : (
        <div className="divide-y rounded-xl border">
          {orders.map((o) => (
            <Link
              key={o.id}
              to="/dashboard/orders/$orderId"
              params={{ orderId: o.id }}
              className="flex items-center justify-between px-5 py-4 hover:bg-accent"
            >
              <div>
                <div className="font-medium">For {o.recipient_name}</div>
                <div className="text-xs text-muted-foreground">
                  {o.order_number} · {o.occasion}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{formatUsd(o.price_cents)}</span>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
