import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { stripe } from '@better-auth/stripe'
import Stripe from 'stripe'
import { db } from '#/db/index'
import * as schema from '#/db/schema'
import { sendEmail } from '#/lib/email'
import { forwardStripeEventToApi } from '#/lib/internal-api'

const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder',
)

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, { provider: 'pg', schema }),

  // PDD has customers + a privileged production team. `role` drives admin access
  // in the api (see require_admin dependency). Not user-editable.
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'customer', input: false },
    },
  },

  // Google login (PDD §37 secure auth).
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    // Passwordless: email a one-time code, sign in with it.
    emailOTP({
      otpLength: 6,
      expiresIn: 5 * 60,
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === 'sign-in'
            ? 'Your StoryTunes sign-in code'
            : 'Verify your StoryTunes email'
        await sendEmail({
          to: email,
          subject,
          text: `Your StoryTunes code is ${otp}. It expires in 5 minutes.\n\nIf you didn't request this, you can ignore this email.`,
        })
      },
    }),

    // Payments: creates a Stripe customer per user and verifies the webhook
    // signature. Verified events are forwarded to the api (the order owner).
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
      createCustomerOnSignUp: true,
      onEvent: async (event) => {
        await forwardStripeEventToApi({
          id: event.id,
          type: event.type,
          data: event.data,
        })
      },
    }),

    tanstackStartCookies(),
  ],
})
