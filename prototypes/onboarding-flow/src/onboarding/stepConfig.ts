/**
 * Onboarding steps — edit this file when you get new assignments.
 * Add an entry to STEPS, then add matching content in StepPanels.tsx.
 */
export type StepId = 'welcome' | 'personal' | 'company' | 'team' | 'done'

export interface StepMeta {
  id: StepId
  title: string
  /** Reminder for future-you / PM handoff — safe to delete anytime */
  assignmentNote?: string
}

export const STEPS: StepMeta[] = [
  {
    id: 'welcome',
    title: 'Welcome',
  },
  {
    id: 'personal',
    title: 'Personal information',
  },
  {
    id: 'company',
    title: 'Company',
    assignmentNote: 'Placeholder form — swap fields per story.',
  },
  {
    id: 'team',
    title: 'Team',
    assignmentNote: 'Invite flow or size — replace when spec arrives.',
  },
  {
    id: 'done',
    title: "You're set",
    assignmentNote: 'Success state + next actions.',
  },
]

export function stepIndex(id: string): number {
  return STEPS.findIndex((s) => s.id === id)
}

export function isValidStepId(id: string): id is StepId {
  return STEPS.some((s) => s.id === id)
}
