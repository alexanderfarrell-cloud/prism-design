import OnboardingLayout from '../components/OnboardingLayout'
import BottomBar from '../components/BottomBar'
import SelectableCard from '../components/SelectableCard'
import InfoBanner from '../components/InfoBanner'
import { COMPANIES } from '../data/companies'
import type { FormData, StepInfo } from '../types'

interface SelectCompanyPageProps {
  formData: FormData
  onUpdate: (patch: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
  stepInfo: StepInfo
}


export default function SelectCompanyPage({
  formData,
  onUpdate,
  onNext,
  onBack,
  stepInfo,
}: SelectCompanyPageProps) {
  return (
    <OnboardingLayout
      bottomBar={<BottomBar onBack={onBack} onNext={onNext} stepInfo={stepInfo} />}
    >
      <h1 className="ob-title">Welcome to Trimble Financials</h1>
      <p className="ob-subtitle">
        We found the following companies linked to your Avalara account. Select the one you want to use for onboarding.
      </p>

      <div className="ob-selectable-list">
        {COMPANIES.map((company) => (
          <SelectableCard
            key={company.id}
            id={company.id}
            title={company.name}
            subtitle={company.location}
            detail={`Account ID: ${company.accountId}`}
            selected={formData.selectedCompanyId === company.id}
            onClick={() => onUpdate({ selectedCompanyId: company.id })}
          />
        ))}
      </div>

      <InfoBanner>
        Only companies linked to your Avalara account are shown. Contact support if your company is missing.
      </InfoBanner>
    </OnboardingLayout>
  )
}
