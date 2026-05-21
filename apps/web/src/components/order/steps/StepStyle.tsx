import { useStore } from '@tanstack/react-store'
import { setField, toggleInArray, wizardStore } from '#/lib/order/store'
import {
  GENRES,
  MOODS,
  SONG_LENGTHS,
  TEMPOS,
  titleCase,
} from '#/lib/order/constants'
import { ChipGroup, Field, OptionChip, StepHeader } from '../primitives'

export function StepStyle() {
  const data = useStore(wizardStore, (s) => s.data)
  const errors = useStore(wizardStore, (s) => s.errors)
  const moods = data.mood ?? []

  return (
    <div className="space-y-6">
      <StepHeader title="Song style" />

      <Field label="Genre (optional)">
        <ChipGroup>
          {GENRES.map((g) => (
            <OptionChip
              key={g}
              label={titleCase(g)}
              selected={data.genre === g}
              onClick={() => setField('genre', g)}
            />
          ))}
        </ChipGroup>
      </Field>

      <Field label="Mood" error={errors.mood} hint="Choose one or more.">
        <ChipGroup>
          {MOODS.map((m) => (
            <OptionChip
              key={m}
              label={titleCase(m)}
              selected={moods.includes(m)}
              onClick={() => toggleInArray('mood', m)}
            />
          ))}
        </ChipGroup>
      </Field>

      <Field label="Tempo" error={errors.tempo}>
        <ChipGroup>
          {TEMPOS.map((t) => (
            <OptionChip
              key={t.value}
              label={t.label}
              selected={data.tempo === t.value}
              onClick={() => setField('tempo', t.value)}
            />
          ))}
        </ChipGroup>
      </Field>

      <Field label="Song length" error={errors.song_length}>
        <ChipGroup>
          {SONG_LENGTHS.map((s) => (
            <OptionChip
              key={s.value}
              label={s.label}
              selected={data.song_length === s.value}
              onClick={() => setField('song_length', s.value)}
            />
          ))}
        </ChipGroup>
      </Field>
    </div>
  )
}
