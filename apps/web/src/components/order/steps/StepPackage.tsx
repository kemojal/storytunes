import { useStore } from '@tanstack/react-store'
import { setField, wizardStore } from '#/lib/order/store'
import { PACKAGES, formatUsd } from '#/lib/order/constants'
import { Field, StepHeader } from '../primitives'
import { cn } from '#/lib/utils'
import { Check } from 'lucide-react'

export function StepPackage() {
  const data = useStore(wizardStore, (s) => s.data)
  const errors = useStore(wizardStore, (s) => s.errors)

  return (
    <div className="space-y-6">
      <StepHeader
        title="Choose a package"
        subtitle="Higher tiers add human polish and production."
      />

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
                  'group relative flex flex-col rounded-2xl border p-5 text-left transition-all duration-300 ease-out cursor-pointer',
                  'hover:-translate-y-1 hover:shadow-soft active:scale-[0.98]',
                  selected
                    ? 'border-gold bg-gradient-to-br from-gold/10 to-rose/5 ring-1 ring-gold/30 shadow-soft-lg scale-[1.02]'
                    : 'border-border/60 bg-card/30 hover:border-primary/50',
                )}
              >
                {/* Micro active indicator dot/check in top right */}
                <div
                  className={cn(
                    'absolute top-4 right-4 flex size-5 items-center justify-center rounded-full border transition-all duration-300',
                    selected
                      ? 'border-gold bg-gold text-primary-foreground scale-100 rotate-0'
                      : 'border-border bg-transparent scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-95',
                  )}
                >
                  <Check className="size-3 stroke-[3]" />
                </div>

                <div className="flex items-baseline justify-between pr-5">
                  <span className="font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-200">
                    {p.name}
                  </span>
                </div>
                <div className="mt-2 text-xl font-bold tracking-tight text-primary">
                  {formatUsd(p.priceCents)}
                </div>
                <span className="mt-2.5 text-xs text-muted-foreground leading-normal">
                  {p.blurb}
                </span>

                <div className="my-4 h-px w-full bg-border/40" />

                <ul className="space-y-2 text-xs flex-1">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-1.5 text-muted-foreground"
                    >
                      <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-gold/70" />
                      <span>{f}</span>
                    </li>
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
