import { useEffect, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { Link, useNavigate } from '@tanstack/react-router'
import { back, next, validateStep, wizardStore } from '#/lib/order/store'
import { STEPS } from '#/lib/order/schema'
import { useSession } from '#/lib/auth-client'
import { analytics } from '#/lib/analytics'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

import { StepOccasion } from './steps/StepOccasion'
import { StepRecipient } from './steps/StepRecipient'
import { StepPackage } from './steps/StepPackage'
import { StepArtist } from './steps/StepArtist'
import { StepStyle } from './steps/StepStyle'
import { StepStory } from './steps/StepStory'
import { StepAddons } from './steps/StepAddons'
import { StepReview } from './steps/StepReview'

function renderStep(key: (typeof STEPS)[number]['key']) {
  switch (key) {
    case 'occasion':
      return <StepOccasion />
    case 'recipient':
      return <StepRecipient />
    case 'package':
      return <StepPackage />
    case 'artist':
      return <StepArtist />
    case 'style':
      return <StepStyle />
    case 'story':
      return <StepStory />
    case 'addons':
      return <StepAddons />
    case 'review':
      return <StepReview />
  }
}

export function Wizard() {
  const navigate = useNavigate()
  const stepIndex = useStore(wizardStore, (s) => s.stepIndex)
  const { data: session } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Client-only: the wizard store is interactive/per-user, so don't SSR it
  // (avoids a hydration mismatch from server-shared store state).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1

  // Funnel: emit a step-viewed event per step so PostHog shows how far visitors
  // get and where they drop off. order_started fires once on first mount.
  useEffect(() => {
    if (!mounted) return
    if (stepIndex === 0) analytics.track('order_started')
  }, [mounted])
  useEffect(() => {
    if (mounted) {
      analytics.track('order_step_viewed', {
        step: step.key,
        index: stepIndex,
        total: STEPS.length,
      })
    }
  }, [mounted, stepIndex, step.key])

  if (!mounted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  async function payAndPlaceOrder() {
    if (!validateStep(stepIndex)) return
    analytics.track('checkout_started', {
      package: wizardStore.state.data.package_type,
    })
    if (!session) {
      navigate({ to: '/sign-in' })
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(wizardStore.state.data),
      })
      if (res.status === 401) {
        navigate({ to: '/sign-in' })
        return
      }
      if (!res.ok) throw new Error(await res.text())
      const { url } = (await res.json()) as { url: string }
      window.location.href = url // hand off to Stripe Checkout
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex justify-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            ♪
          </span>
          <span className="font-display text-base font-semibold">
            StoryTunes
          </span>
        </Link>
      </div>

      {/* progress */}
      <div className="mb-8">
        <div className="mb-2.5 flex items-baseline justify-between text-xs">
          <span className="font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            Step {stepIndex + 1} / {STEPS.length}
          </span>
          <span className="font-semibold text-foreground/80 tracking-wide">
            {step.title}
          </span>
        </div>
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-500 ease-out',
                i < stepIndex
                  ? 'bg-gold shadow-[0_0_8px_rgba(200,160,80,0.4)]'
                  : i === stepIndex
                    ? 'bg-primary shadow-[0_0_8px_var(--primary)]'
                    : 'bg-border/60',
              )}
            />
          ))}
        </div>
      </div>

      {/* step card */}
      <div className="relative rounded-3xl border border-border/50 bg-card/85 premium-glass p-6 shadow-soft-lg sm:p-8">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-gold/5 to-rose/5 blur-2xl opacity-20 -z-10" />
        <div key={step.key} className="rise-in">
          {renderStep(step.key)}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive animate-pulse">
          {error}
        </p>
      )}

      <div className="mt-7 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={back}
          disabled={stepIndex === 0 || submitting}
          className="rounded-full px-5 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          ← Back
        </Button>
        {isLast ? (
          <Button
            onClick={payAndPlaceOrder}
            disabled={submitting}
            size="lg"
            className="rounded-full px-8 shadow-soft-lg hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {submitting ? 'Redirecting…' : 'Pay & place order'}
          </Button>
        ) : (
          <Button
            onClick={next}
            size="lg"
            className="rounded-full px-8 shadow-soft-lg hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Continue →
          </Button>
        )}
      </div>
      <p className="mt-5 text-center text-xs font-semibold tracking-wide text-muted-foreground/60">
        YOUR PROGRESS IS SAVED AS YOU GO.
      </p>
    </div>
  )
}
