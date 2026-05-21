import posthog from 'posthog-js'

/**
 * Thin analytics wrapper around PostHog. PostHog auto-captures pageviews
 * (SPA history changes) and clicks (autocapture); these helpers add the
 * order-funnel events and consent controls. All calls are no-ops if PostHog
 * isn't initialised (no key) or the visitor hasn't opted in.
 */
export const analytics = {
  optIn() {
    try {
      posthog.opt_in_capturing()
    } catch {
      /* not initialised */
    }
  },
  optOut() {
    try {
      posthog.opt_out_capturing()
    } catch {
      /* not initialised */
    }
  },
  track(event: string, props?: Record<string, unknown>) {
    try {
      posthog.capture(event, props)
    } catch {
      /* not initialised */
    }
  },
  identify(id: string, props?: Record<string, unknown>) {
    try {
      posthog.identify(id, props)
    } catch {
      /* not initialised */
    }
  },
}
