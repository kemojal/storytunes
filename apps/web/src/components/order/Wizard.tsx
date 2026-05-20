import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { Link, useNavigate } from '@tanstack/react-router'
import { back, next, validateStep, wizardStore } from '#/lib/order/store'
import { STEPS } from '#/lib/order/schema'
import { useSession } from '#/lib/auth-client'
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
    case 'occasion': return <StepOccasion />
    case 'recipient': return <StepRecipient />
    case 'package': return <StepPackage />
    case 'artist': return <StepArtist />
    case 'style': return <StepStyle />
    case 'story': return <StepStory />
    case 'addons': return <StepAddons />
    case 'review': return <StepReview />
  }
}

export function Wizard() {
  const navigate = useNavigate()
  const stepIndex = useStore(wizardStore, (s) => s.stepIndex)
  const { data: session } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1

  async function payAndPlaceOrder() {
    if (!validateStep(stepIndex)) return
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
          <span className="font-display text-base font-semibold">StoryTunes</span>
        </Link>
      </div>

      {/* progress */}
      <div className="mb-8">
        <div className="mb-2.5 flex items-baseline justify-between text-xs">
          <span className="font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Step {stepIndex + 1} / {STEPS.length}
          </span>
          <span className="font-medium text-foreground/70">{step.title}</span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-300',
                i < stepIndex ? 'bg-gold' : i === stepIndex ? 'bg-primary' : 'bg-border',
              )}
            />
          ))}
        </div>
      </div>

      {/* step card */}
      <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-soft sm:p-8">
        <div key={step.key} className="rise-in">
          {renderStep(step.key)}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-7 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={back}
          disabled={stepIndex === 0 || submitting}
          className="rounded-full"
        >
          ← Back
        </Button>
        {isLast ? (
          <Button onClick={payAndPlaceOrder} disabled={submitting} size="lg" className="rounded-full px-7">
            {submitting ? 'Redirecting…' : 'Pay & place order'}
          </Button>
        ) : (
          <Button onClick={next} size="lg" className="rounded-full px-7">
            Continue →
          </Button>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground/70">
        Your progress is saved as you go.
      </p>
    </div>
  )
}
