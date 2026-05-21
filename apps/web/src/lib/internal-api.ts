/**
 * Service-to-service client: web -> api.
 *
 * The api owns the business tables (orders, etc.), so when web verifies a
 * Stripe event it forwards it to the api over a shared internal key. The api
 * validates `X-Internal-Key` and performs the order write itself.
 */
const API_URL = process.env.API_URL ?? 'http://localhost:8000'
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? ''

// Stripe event types the api cares about for the song-order lifecycle.
const FORWARDED_EVENTS = new Set([
  'checkout.session.completed',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.refunded',
])

export async function forwardStripeEventToApi(event: {
  id: string
  type: string
  data: unknown
}) {
  if (!FORWARDED_EVENTS.has(event.type)) return

  try {
    const res = await fetch(`${API_URL}/api/internal/stripe-events`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-key': INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        id: event.id,
        type: event.type,
        data: event.data,
      }),
    })
    if (!res.ok) {
      console.error(
        `[internal-api] forward ${event.type} failed: ${res.status} ${await res.text()}`,
      )
    }
  } catch (err) {
    // Stripe will retry the webhook; don't crash the handler.
    console.error('[internal-api] forward error', err)
  }
}
