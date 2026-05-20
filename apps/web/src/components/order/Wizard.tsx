import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { useNavigate } from '@tanstack/react-router'
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
  const progress = ((stepIndex + 1) / STEPS.length) * 100

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
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* progress */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Step {stepIndex + 1} of {STEPS.length}</span>
          <span>{step.title}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={cn(
                'h-1 flex-1 rounded-full',
                i <= stepIndex ? 'bg-primary/60' : 'bg-muted',
              )}
            />
          ))}
        </div>
      </div>

      {renderStep(step.key)}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-10 flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={stepIndex === 0 || submitting}>
          Back
        </Button>
        {isLast ? (
          <Button onClick={payAndPlaceOrder} disabled={submitting}>
            {submitting ? 'Redirecting…' : 'Pay & place order'}
          </Button>
        ) : (
          <Button onClick={next}>Continue</Button>
        )}
      </div>
    </div>
  )
}
