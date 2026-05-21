import posthog from 'posthog-js'
import { PostHogProvider as BasePostHogProvider } from '@posthog/react'
import type { ReactNode } from 'react'

if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    // SPA pageviews on route change; autocapture handles click tracking.
    capture_pageview: 'history_change',
    autocapture: true,
    // Respect cookie consent: don't track until the visitor opts in.
    opt_out_capturing_by_default: true,
    defaults: '2025-11-30',
  })
  // Re-enable if they already accepted in a previous visit.
  if (localStorage.getItem('st-cookie-consent') === 'accepted') {
    posthog.opt_in_capturing()
  }
}

interface PostHogProviderProps {
  children: ReactNode
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  return <BasePostHogProvider client={posthog}>{children}</BasePostHogProvider>
}
