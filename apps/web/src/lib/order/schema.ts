import { z } from 'zod'
import {
  GENRES,
  MOODS,
  OCCASIONS,
  RELATIONSHIPS,
  SONG_LENGTHS,
  TEMPOS,
} from './constants'

const enumOf = <T extends readonly [string, ...string[]]>(vals: T) =>
  z.enum(vals)

// Per-step schemas. Each step validates only its own slice on "Next".
export const occasionSchema = z.object({
  occasion: enumOf(OCCASIONS),
  occasion_date: z.string().optional(),
  is_surprise: z.boolean(),
  delivery_speed: z.enum(['standard', 'rush']),
})

export const recipientSchema = z.object({
  recipient_name: z.string().min(1, 'Recipient name is required'),
  recipient_nickname: z.string().optional(),
  mention_name_preference: z.enum(['real_name', 'nickname', 'none']),
  relationship: enumOf(RELATIONSHIPS),
})

export const artistSchema = z.object({
  // Optional for lower tiers; "help_me_choose" lets the team pick.
  artist_id: z.string().optional(),
  artist_mode: z.enum(['pick', 'help_me_choose']),
})

export const styleSchema = z.object({
  genre: enumOf(GENRES).optional(),
  mood: z.array(enumOf(MOODS)).min(1, 'Pick at least one mood'),
  tempo: z.enum(TEMPOS.map((t) => t.value) as [string, ...string[]]),
  song_length: z.enum(
    SONG_LENGTHS.map((s) => s.value) as [string, ...string[]],
  ),
})

export const storySchema = z.object({
  story: z.string().min(1, 'Tell us your story'),
  favorite_memories: z.string().optional(),
  how_they_met: z.string().optional(),
  what_makes_them_special: z.string().optional(),
  inside_jokes: z.string().optional(),
  important_dates_places: z.string().optional(),
  challenges: z.string().optional(),
  desired_feelings: z.array(z.string()).default([]),
  things_to_avoid: z.string().optional(),
})

export const addonsSchema = z.object({
  addons: z.array(z.string()).default([]),
})

export const packageSchema = z.object({
  package_type: z.enum(['starter', 'signature', 'premium']),
})

export const reviewSchema = z.object({
  accept_terms: z.literal(true, {
    message: 'You must accept the terms to continue',
  }),
})

// Full wizard data = union of all step shapes.
export const wizardSchema = occasionSchema
  .merge(recipientSchema)
  .merge(artistSchema)
  .merge(styleSchema)
  .merge(storySchema)
  .merge(addonsSchema)
  .merge(packageSchema)
  .merge(reviewSchema.partial())

export type WizardData = z.infer<typeof wizardSchema>

// Step registry — order, title, and which schema validates it.
export const STEPS = [
  { key: 'occasion', title: 'Occasion', schema: occasionSchema },
  { key: 'recipient', title: 'Recipient', schema: recipientSchema },
  { key: 'package', title: 'Package', schema: packageSchema },
  { key: 'artist', title: 'Artist', schema: artistSchema },
  { key: 'style', title: 'Song style', schema: styleSchema },
  { key: 'story', title: 'Your story', schema: storySchema },
  { key: 'addons', title: 'Add-ons', schema: addonsSchema },
  { key: 'review', title: 'Review', schema: reviewSchema },
] as const

export type StepKey = (typeof STEPS)[number]['key']
