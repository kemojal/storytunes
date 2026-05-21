import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { resetWizard } from '#/lib/order/store'
import { analytics } from '#/lib/analytics'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/order/success')({
  component: OrderSuccess,
})

function OrderSuccess() {
  // Payment confirmed by Stripe -> webhook -> api. Clear the local draft.
  useEffect(() => {
    analytics.track('order_completed')
    resetWizard()
  }, [])

  return (
    <div className="mx-auto mt-24 max-w-md space-y-4 px-4 text-center">
      <h1 className="text-3xl font-semibold">Your song is on its way 🎵</h1>
      <p className="text-muted-foreground">
        Payment received. We've started production and emailed your
        confirmation. Track progress anytime from your orders.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Button asChild>
          <Link to="/">Back home</Link>
        </Button>
      </div>
    </div>
  )
}
