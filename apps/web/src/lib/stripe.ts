import Stripe from 'stripe'

// One key set. The key prefix (sk_test_… / sk_live_…) is the actual Stripe mode
// — there is no separate base URL. STRIPE_MODE just declares intent (default
// test locally); swap STRIPE_SECRET_KEY to your live key in production.
// `||` (not `??`) so an empty string also falls back to the placeholder.
const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripeMode: 'test' | 'live' = secretKey.startsWith('sk_live')
  ? 'live'
  : 'test'

export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

// Single Stripe client for the server (better-auth plugin + checkout route).
export const stripe = new Stripe(secretKey)
