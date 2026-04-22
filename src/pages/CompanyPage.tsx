import { ModusWcTextInput, ModusWcSelect } from '@trimble-oss/moduswebcomponents-react'
import OnboardingLayout from '../components/OnboardingLayout'
import BottomBar from '../components/BottomBar'
import type { FormData, StepInfo } from '../types'

interface CompanyPageProps {
  formData: FormData
  onUpdate: (patch: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
  stepInfo: StepInfo
}

const COMPANY_TYPE_OPTIONS = [
  { label: 'LLC', value: 'llc' },
  { label: 'Corporation', value: 'corporation' },
  { label: 'Sole Proprietorship', value: 'sole-proprietorship' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Other', value: 'other' },
]

export default function CompanyPage({
  formData,
  onUpdate,
  onNext,
  onBack,
  stepInfo,
}: CompanyPageProps) {
  return (
    <OnboardingLayout
      bottomBar={<BottomBar onBack={onBack} onNext={onNext} stepInfo={stepInfo} />}
    >
      <h1 className="ob-title">Welcome to Trimble Financials</h1>
      <p className="ob-subtitle">Tell us about your company.</p>

      <div className="ob-form">
        <div className="ob-field">
          <p className="ob-label">Company name</p>
          <ModusWcTextInput
            value={formData.companyName}
            onInputChange={(e: CustomEvent) =>
              onUpdate({ companyName: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>

        <div className="ob-field">
          <p className="ob-label">Type of company</p>
          <ModusWcSelect
            options={COMPANY_TYPE_OPTIONS}
            value={formData.companyType}
            onInputChange={(e: CustomEvent) =>
              onUpdate({ companyType: (e.detail as string) ?? '' })
            }
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}
