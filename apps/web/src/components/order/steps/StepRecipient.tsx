import { useStore } from '@tanstack/react-store'
import { setField, wizardStore } from '#/lib/order/store'
import {
  MENTION_PREFERENCES,
  RELATIONSHIPS,
  titleCase,
} from '#/lib/order/constants'
import { ChipGroup, Field, OptionChip, StepHeader } from '../primitives'
import { Input } from '#/components/ui/input'

export function StepRecipient() {
  const data = useStore(wizardStore, (s) => s.data)
  const errors = useStore(wizardStore, (s) => s.errors)

  return (
    <div className="space-y-6">
      <StepHeader title="Who is this song for?" />

      <Field label="Recipient name" error={errors.recipient_name}>
        <Input
          value={data.recipient_name ?? ''}
          onChange={(e) => setField('recipient_name', e.target.value)}
          placeholder="e.g. Maya"
        />
      </Field>

      <Field label="Nickname (optional)">
        <Input
          value={data.recipient_nickname ?? ''}
          onChange={(e) => setField('recipient_nickname', e.target.value)}
          placeholder="e.g. May"
        />
      </Field>

      <Field
        label="Should we mention their name?"
        error={errors.mention_name_preference}
      >
        <ChipGroup>
          {MENTION_PREFERENCES.map((m) => (
            <OptionChip
              key={m.value}
              label={m.label}
              selected={data.mention_name_preference === m.value}
              onClick={() => setField('mention_name_preference', m.value)}
            />
          ))}
        </ChipGroup>
      </Field>

      <Field label="Relationship" error={errors.relationship}>
        <ChipGroup>
          {RELATIONSHIPS.map((r) => (
            <OptionChip
              key={r}
              label={titleCase(r)}
              selected={data.relationship === r}
              onClick={() => setField('relationship', r)}
            />
          ))}
        </ChipGroup>
      </Field>
    </div>
  )
}
