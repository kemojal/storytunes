import { useStore } from '@tanstack/react-store'
import { setField, toggleInArray, wizardStore } from '#/lib/order/store'
import { DESIRED_FEELINGS, titleCase } from '#/lib/order/constants'
import { ChipGroup, Field, OptionChip, StepHeader } from '../primitives'
import { Textarea } from '#/components/ui/textarea'
import type { WizardData } from '#/lib/order/schema'

const PROMPTS: Array<{
  key: keyof WizardData
  label: string
  placeholder: string
}> = [
  {
    key: 'story',
    label: 'How did you meet, or what is your story?',
    placeholder: 'We met in Taiwan at a coffee shop…',
  },
  {
    key: 'favorite_memories',
    label: 'Favorite memories together',
    placeholder: 'Rainy walks, mango smoothies…',
  },
  {
    key: 'what_makes_them_special',
    label: 'What makes this person special?',
    placeholder: '',
  },
  {
    key: 'inside_jokes',
    label: 'Inside jokes, nicknames, or phrases',
    placeholder: '',
  },
  {
    key: 'important_dates_places',
    label: 'Important dates or places',
    placeholder: '',
  },
  {
    key: 'challenges',
    label: 'Challenges you went through together',
    placeholder: '',
  },
  {
    key: 'things_to_avoid',
    label: 'Anything to avoid?',
    placeholder: 'Do not make it too sad…',
  },
]

export function StepStory() {
  const data = useStore(wizardStore, (s) => s.data)
  const errors = useStore(wizardStore, (s) => s.errors)
  const feelings = data.desired_feelings ?? []

  return (
    <div className="space-y-6">
      <StepHeader
        title="Tell their story"
        subtitle="The more heart you share, the more personal the song. Only the first is required."
      />

      {PROMPTS.map((p) => (
        <Field
          key={p.key}
          label={p.label}
          error={p.key === 'story' ? errors.story : undefined}
        >
          <Textarea
            rows={3}
            value={(data[p.key] as string | undefined) ?? ''}
            placeholder={p.placeholder}
            onChange={(e) => setField(p.key, e.target.value as never)}
          />
        </Field>
      ))}

      <Field label="How should they feel?">
        <ChipGroup>
          {DESIRED_FEELINGS.map((f) => (
            <OptionChip
              key={f}
              label={titleCase(f)}
              selected={feelings.includes(f)}
              onClick={() => toggleInArray('desired_feelings', f)}
            />
          ))}
        </ChipGroup>
      </Field>
    </div>
  )
}
