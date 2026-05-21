// Option sets + pricing for the order wizard (PDD §10.5, §11).
// Package/add-on prices mirror apps/api/app/services/pricing.py — the api is
// the source of truth at order-create time; these drive the UI + estimate.

export type Option<T extends string = string> = { value: T; label: string }

export const OCCASIONS = [
  'anniversary',
  'birthday',
  'wedding',
  'proposal',
  'valentines',
  'mothers_day',
  'fathers_day',
  'graduation',
  'apology',
  'friendship',
  'long_distance',
  'memorial',
  'just_because',
  'other',
] as const

export const OCCASION_LABELS: Record<(typeof OCCASIONS)[number], string> = {
  anniversary: 'Anniversary',
  birthday: 'Birthday',
  wedding: 'Wedding',
  proposal: 'Proposal',
  valentines: "Valentine's Day",
  mothers_day: "Mother's Day",
  fathers_day: "Father's Day",
  graduation: 'Graduation',
  apology: 'Apology',
  friendship: 'Friendship',
  long_distance: 'Long-distance love',
  memorial: 'Memorial / tribute',
  just_because: 'Just because',
  other: 'Other',
}

export const RELATIONSHIPS = [
  'wife',
  'husband',
  'girlfriend',
  'boyfriend',
  'mom',
  'dad',
  'friend',
  'sibling',
  'child',
  'grandparent',
  'other',
] as const

export const MENTION_PREFERENCES = [
  { value: 'real_name', label: 'Yes, use real name' },
  { value: 'nickname', label: 'Yes, use nickname' },
  { value: 'none', label: 'No, do not mention name' },
] as const

export const GENRES = [
  'acoustic_pop',
  'rnb',
  'soul',
  'afrobeat',
  'gospel',
  'country',
  'folk',
  'piano_ballad',
  'pop_ballad',
  'soft_rock',
  'custom',
] as const

export const MOODS = [
  'romantic',
  'emotional',
  'joyful',
  'nostalgic',
  'funny',
  'heartfelt',
  'uplifting',
  'peaceful',
  'celebratory',
  'hopeful',
] as const

export const TEMPOS = [
  { value: 'slow', label: 'Slow' },
  { value: 'medium', label: 'Medium' },
  { value: 'upbeat', label: 'Upbeat' },
  { value: 'artist_choice', label: 'Let the artist decide' },
] as const

export const SONG_LENGTHS = [
  { value: 'short', label: 'Short — 60–90s' },
  { value: 'standard', label: 'Standard — 2–3 min' },
  { value: 'premium', label: 'Premium — 3–4 min' },
] as const

export const DESIRED_FEELINGS = [
  'loved',
  'appreciated',
  'seen',
  'celebrated',
  'forgiven',
  'missed',
  'proud',
  'remembered',
  'hopeful',
  'emotional',
] as const

export type PackageType = 'starter' | 'signature' | 'premium'

export const PACKAGES: Array<{
  value: PackageType
  name: string
  priceCents: number
  blurb: string
  features: string[]
}> = [
  {
    value: 'starter',
    name: 'Starter Song',
    priceCents: 4900,
    blurb: '60–90s · AI-assisted · 3–5 days',
    features: ['AI-assisted lyrics', 'MP3 delivery', 'Up to 1 small revision'],
  },
  {
    value: 'signature',
    name: 'Signature Song',
    priceCents: 9900,
    blurb: '2–3 min · human-polished · 5–7 days',
    features: [
      'Custom lyrics',
      'Selected artist style',
      'Lyric sheet',
      '1 revision',
    ],
  },
  {
    value: 'premium',
    name: 'Premium Band Song',
    priceCents: 19900,
    blurb: '3–4 min · human/band production · 7–10 days',
    features: [
      'MP3 + WAV',
      'Instrumental version',
      'Private share page',
      '2 revisions',
    ],
  },
]

export const ADDONS: Array<{
  value: string
  label: string
  priceCents: number
}> = [
  { value: 'rush', label: 'Rush delivery', priceCents: 2900 },
  { value: 'instrumental', label: 'Instrumental version', priceCents: 1500 },
  { value: 'lyric_sheet', label: 'Printable lyric sheet', priceCents: 900 },
  { value: 'lyric_video', label: 'Lyric video', priceCents: 3900 },
  { value: 'cover_art', label: 'Cover artwork', priceCents: 1900 },
  { value: 'private_gift_page', label: 'Private gift page', priceCents: 1200 },
  { value: 'extra_revision', label: 'Extra revision', priceCents: 2500 },
  { value: 'wav', label: 'WAV master', priceCents: 1500 },
]

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function labelOf<T extends string>(
  opts: ReadonlyArray<Option<T>> | ReadonlyArray<{ value: T; label: string }>,
  value: T | undefined,
): string {
  return opts.find((o) => o.value === value)?.label ?? value ?? ''
}

export function titleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
