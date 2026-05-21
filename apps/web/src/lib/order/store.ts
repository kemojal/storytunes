import { Store } from '@tanstack/store'
import { STEPS  } from './schema'
import type {WizardData} from './schema';

export type WizardState = {
  stepIndex: number
  data: Partial<WizardData>
  errors: Record<string, string>
}

const initialData: Partial<WizardData> = {
  is_surprise: true,
  delivery_speed: 'standard',
  artist_mode: 'help_me_choose',
  mood: [],
  desired_feelings: [],
  addons: [],
}

export const wizardStore = new Store<WizardState>({
  stepIndex: 0,
  data: { ...initialData },
  errors: {},
})

export function setField<K extends keyof WizardData>(
  key: K,
  value: WizardData[K],
) {
  wizardStore.setState((s) => ({
    ...s,
    data: { ...s.data, [key]: value },
    errors: { ...s.errors, [key as string]: '' },
  }))
}

/** Toggle a value in an array field (moods, feelings, add-ons). */
export function toggleInArray(key: keyof WizardData, value: string) {
  wizardStore.setState((s) => {
    const current = (s.data[key] as string[] | undefined) ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    return { ...s, data: { ...s.data, [key]: next } }
  })
}

/** Validate the current step; returns true if valid, else stores field errors. */
export function validateStep(index: number): boolean {
  const step = STEPS[index]
  const result = step.schema.safeParse(wizardStore.state.data)
  if (result.success) {
    wizardStore.setState((s) => ({ ...s, errors: {} }))
    return true
  }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path[0]
    if (typeof path === 'string') errors[path] = issue.message
  }
  wizardStore.setState((s) => ({ ...s, errors }))
  return false
}

export function next() {
  if (!validateStep(wizardStore.state.stepIndex)) return
  wizardStore.setState((s) => ({
    ...s,
    stepIndex: Math.min(s.stepIndex + 1, STEPS.length - 1),
  }))
}

export function back() {
  wizardStore.setState((s) => ({
    ...s,
    stepIndex: Math.max(s.stepIndex - 1, 0),
    errors: {},
  }))
}

export function goTo(index: number) {
  wizardStore.setState((s) => ({ ...s, stepIndex: index, errors: {} }))
}

export function resetWizard() {
  wizardStore.setState(() => ({
    stepIndex: 0,
    data: { ...initialData },
    errors: {},
  }))
}
