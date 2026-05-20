import Stripe from 'stripe'

// Single Stripe client for the server (better-auth plugin + checkout route).
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder',
)
