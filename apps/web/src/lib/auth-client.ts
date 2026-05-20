import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'
import { stripeClient } from '@better-auth/stripe/client'

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), stripeClient()],
})

export const { signIn, signOut, useSession, emailOtp } = authClient
