import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { stripe } from '#/lib/stripe'

const API_URL = process.env.API_URL ?? 'http://localhost:8000'
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? ''
const ORIGIN = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

type CreatedOrder = {
  id: string
  order_number: string
  price_cents: number
  currency: string
}

/**
 * Order + payment handoff.
 *   1. better-auth verifies the user (session cookie -> user).
 *   2. api creates the order (price computed server-side, the source of truth).
 *   3. Stripe Checkout Session opened for that price; order_id in metadata.
 *   4. Stripe webhook -> web (better-auth) -> forwarded to api -> order marked paid.
 */
export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session?.user) {
          return new Response('Unauthorized', { status: 401 })
        }

        const wizard = await request.json()

        // 2. create the order in the api on the user's behalf.
        const orderRes = await fetch(`${API_URL}/api/internal/orders`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-internal-key': INTERNAL_API_KEY,
          },
          body: JSON.stringify({ ...wizard, user_id: session.user.id }),
        })
        if (!orderRes.ok) {
          return new Response(`Order create failed: ${await orderRes.text()}`, {
            status: 502,
          })
        }
        const order = (await orderRes.json()) as CreatedOrder

        // 3. open Stripe Checkout.
        const customerId = (session.user as { stripeCustomerId?: string })
          .stripeCustomerId
        const checkout = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: order.currency,
                unit_amount: order.price_cents,
                product_data: {
                  name: `StoryTunes custom song — ${order.order_number}`,
                },
              },
            },
          ],
          ...(customerId ? { customer: customerId } : {}),
          client_reference_id: order.id,
          metadata: { order_id: order.id },
          success_url: `${ORIGIN}/order/success`,
          cancel_url: `${ORIGIN}/order`,
        })

        return Response.json({ url: checkout.url })
      },
    },
  },
})
