import { useStore } from '@tanstack/react-store'
import { setField, wizardStore } from '#/lib/order/store'
import { PACKAGES, formatUsd } from '#/lib/order/constants'
import { Field, StepHeader } from '../primitives'
import { cn } from '#/lib/utils'

export function StepPackage() {
  const data = useStore(wizardStore, (s) => s.data)
  const errors = useStore(wizardStore, (s) => s.errors)

  return (
    <div className="space-y-6">
      <StepHeader title="Choose a package" subtitle="Higher tiers add human polish and production." />

      <Field error={errors.package_type}>
        <div className="grid gap-4 md:grid-cols-3">
          {PACKAGES.map((p) => {
            const selected = data.package_type === p.value
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setField('package_type', p.value)}
                className={cn(
                  'flex flex-col rounded-xl border p-5 text-left transition-colors',
                  selected ? 'border-gold bg-accent/30 ring-2 ring-gold/40 shadow-soft' : 'border-input hover:border-primary/50',
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-lg font-bold">{formatUsd(p.priceCents)}</span>
                </div>
                <span className="mt-1 text-xs text-muted-foreground">{p.blurb}</span>
                <ul className="mt-4 space-y-1 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="text-muted-foreground">• {f}</li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      </Field>
    </div>
  )
}
