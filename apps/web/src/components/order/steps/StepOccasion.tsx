import { useStore } from '@tanstack/react-store'
import { setField, wizardStore } from '#/lib/order/store'
import { OCCASIONS, OCCASION_LABELS } from '#/lib/order/constants'
import { ChipGroup, Field, OptionChip, StepHeader } from '../primitives'
import { Input } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'

export function StepOccasion() {
  const data = useStore(wizardStore, (s) => s.data)
  const errors = useStore(wizardStore, (s) => s.errors)

  return (
    <div className="space-y-6">
      <StepHeader title="What's the occasion?" subtitle="This sets the emotional tone of the song." />

      <Field label="Occasion" error={errors.occasion}>
        <ChipGroup>
          {OCCASIONS.map((o) => (
            <OptionChip
              key={o}
              label={OCCASION_LABELS[o]}
              selected={data.occasion === o}
              onClick={() => setField('occasion', o)}
            />
          ))}
        </ChipGroup>
      </Field>

      <Field label="Occasion date (optional)" hint="Helps us hit your deadline.">
        <Input
          type="date"
          value={data.occasion_date ?? ''}
          onChange={(e) => setField('occasion_date', e.target.value)}
        />
      </Field>

      <Field label="Delivery speed">
        <ChipGroup>
          <OptionChip
            label="Standard"
            selected={data.delivery_speed === 'standard'}
            onClick={() => setField('delivery_speed', 'standard')}
          />
          <OptionChip
            label="Rush (+$29)"
            selected={data.delivery_speed === 'rush'}
            onClick={() => setField('delivery_speed', 'rush')}
          />
        </ChipGroup>
      </Field>

      <div className="flex items-center gap-3">
        <Switch
          id="surprise"
          checked={data.is_surprise ?? true}
          onCheckedChange={(v) => setField('is_surprise', v)}
        />
        <label htmlFor="surprise" className="text-sm">
          This is a surprise gift
        </label>
      </div>
    </div>
  )
}
