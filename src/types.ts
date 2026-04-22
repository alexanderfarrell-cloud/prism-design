export type Step =
  | 'intro'
  | 'personal-info'
  | 'company'
  | 'location'
  | 'tax-compliance'
  | 'avalara-credentials'
  | 'finding-account'
  | 'select-company'
  | 'review'
  | 'processing'
  | 'complete'

export interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  companyType: string
  address: string
  state: string
  city: string
  zipCode: string
  billingAddressSame: boolean
  hasAvalaraAccount: boolean | null
  avalaraUsername: string
  avalaraAccountId: string
  selectedCompanyId: string
}

export const INITIAL_FORM_DATA: FormData = {
  firstName: 'Alex',
  lastName: 'Rivera',
  email: 'alex.rivera@trimble.com',
  phone: '(512) 555-0147',
  companyName: 'Acme Construction LLC',
  companyType: 'llc',
  address: '4521 Oak Ridge Dr',
  state: 'Texas',
  city: 'Austin',
  zipCode: '78745',
  billingAddressSame: true,
  hasAvalaraAccount: null,
  avalaraUsername: 'alex.farrell@trimble.com',
  avalaraAccountId: '2109384756',
  selectedCompanyId: 'farrell-construction',
}

export interface StepInfo {
  current: number
  total: number
}

export function getStepInfo(step: Step, hasAvalara: boolean | null): StepInfo | null {
  if (step === 'personal-info') return { current: 1, total: 4 }
  if (step === 'company') return { current: 2, total: 4 }
  if (step === 'location') return { current: 3, total: 4 }
  if (step === 'tax-compliance') return null
  if (hasAvalara) {
    if (step === 'avalara-credentials') return { current: 4, total: 6 }
    if (step === 'select-company') return { current: 5, total: 6 }
    if (step === 'review') return { current: 6, total: 6 }
  } else {
    if (step === 'review') return { current: 4, total: 4 }
  }
  return null
}
