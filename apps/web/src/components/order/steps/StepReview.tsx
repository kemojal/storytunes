import { useStore } from '@tanstack/react-store'
import { setField, wizardStore } from '#/lib/order/store'
import {
  ADDONS,
  MENTION_PREFERENCES,
  OCCASION_LABELS,
  PACKAGES,
  SONG_LENGTHS,
  TEMPOS,
  formatUsd,
  labelOf,
  titleCase,
} from '#/lib/order/constants'
import { Field, StepHeader } from '../primitives'
import { Switch } from '#/components/ui/switch'
import type { WizardData } from '#/lib/order/schema'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || '—'}</span>
    </div>
  )
}

export function estimateCents(data: Partial<WizardData>): number {
  const pkg = PACKAGES.find((p) => p.value === data.package_type)
  const base = pkg?.priceCents ?? 0
  const addons = (data.addons ?? []).reduce(
    (sum, v) => sum + (ADDONS.find((a) => a.value === v)?.priceCents ?? 0),
    0,
  )
  const rush = data.delivery_speed === 'rush' ? 2900 : 0
  return base + addons + rush
}

export function StepReview() {
  const data = useStore(wizardStore, (s) => s.data)
  const errors = useStore(wizardStore, (s) => s.errors)
  const pkg = PACKAGES.find((p) => p.value === data.package_type)
  const total = estimateCents(data)

  return (
    <div className="space-y-6">
      <StepHeader
        title="Review your order"
        subtitle="Make sure everything feels right."
      />

      <div className="rounded-xl border p-5">
        <Row
          label="For"
          value={`${data.recipient_name ?? ''} (${data.relationship ? titleCase(data.relationship) : ''})`}
        />
        <Row
          label="Occasion"
          value={data.occasion ? OCCASION_LABELS[data.occasion] : ''}
        />
        <Row
          label="Mention name"
          value={labelOf(MENTION_PREFERENCES, data.mention_name_preference)}
        />
        <Row label="Package" value={pkg?.name ?? ''} />
        <Row
          label="Artist"
          value={
            data.artist_mode === 'pick'
              ? (data.artist_id ?? 'Selected')
              : 'Help me choose'
          }
        />
        <Row label="Genre" value={data.genre ? titleCase(data.genre) : ''} />
        <Row label="Mood" value={(data.mood ?? []).map(titleCase).join(', ')} />
        <Row label="Tempo" value={labelOf(TEMPOS, data.tempo)} />
        <Row label="Length" value={labelOf(SONG_LENGTHS, data.song_length)} />
        <Row
          label="Delivery"
          value={data.delivery_speed === 'rush' ? 'Rush' : 'Standard'}
        />
        <Row
          label="Add-ons"
          value={(data.addons ?? [])
            .map((v) => ADDONS.find((a) => a.value === v)?.label ?? v)
            .join(', ')}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-5">
        <span className="font-medium">Estimated total</span>
        <span className="text-2xl font-bold">{formatUsd(total)}</span>
      </div>

      <Field error={errors.accept_terms}>
        <div className="flex items-start gap-3">
          <Switch
            id="terms"
            checked={data.accept_terms === true}
            onCheckedChange={(v) => setField('accept_terms', v as true)}
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I accept the Terms of Service, Refund & Revision policy, and the
            AI/human production disclosure.
          </label>
        </div>
      </Field>
    </div>
  )
}
