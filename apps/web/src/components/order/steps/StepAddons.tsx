import { useStore } from '@tanstack/react-store'
import { toggleInArray, wizardStore } from '#/lib/order/store'
import { ADDONS, formatUsd } from '#/lib/order/constants'
import { StepHeader } from '../primitives'
import { cn } from '#/lib/utils'

export function StepAddons() {
  const data = useStore(wizardStore, (s) => s.data)
  const addons = data.addons ?? []

  return (
    <div className="space-y-6">
      <StepHeader title="Make it extra special" subtitle="Optional add-ons." />

      <div className="grid gap-3 sm:grid-cols-2">
        {ADDONS.map((a) => {
          const selected = addons.includes(a.value)
          return (
            <button
              key={a.value}
              type="button"
              onClick={() => toggleInArray('addons', a.value)}
              className={cn(
                'flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                selected ? 'border-primary ring-2 ring-primary/30' : 'border-input hover:border-primary/50',
              )}
            >
              <span className="text-sm">{a.label}</span>
              <span className="text-sm font-medium text-muted-foreground">
                +{formatUsd(a.priceCents)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
