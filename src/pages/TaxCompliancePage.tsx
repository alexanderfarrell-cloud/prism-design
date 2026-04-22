import OnboardingLayout from '../components/OnboardingLayout'
import BottomBar from '../components/BottomBar'
import RadioCard from '../components/RadioCard'
import type { FormData } from '../types'

interface TaxCompliancePageProps {
  formData: FormData
  onUpdate: (patch: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function TaxCompliancePage({
  formData,
  onUpdate,
  onNext,
  onBack,
}: TaxCompliancePageProps) {
  const hasAccount = formData.hasAvalaraAccount

  function handleChange(value: string) {
    onUpdate({ hasAvalaraAccount: value === 'yes' })
  }

  return (
    <OnboardingLayout
      bottomBar={
        <BottomBar
          onBack={onBack}
          onNext={onNext}
          nextDisabled={hasAccount === null}
          stepInfo={null}
        />
      }
    >
      <h1 className="ob-title">Connect your tax compliance</h1>
      <p className="ob-subtitle ob-subtitle-long">
        Almost done. Trimble Financials uses Avalara to manage your sales tax compliance.
        If you already have an Avalara account, we'll connect it to sync your settings.
        Otherwise, we'll set one up using the information you've provided.
      </p>

      <div className="ob-radio-group">
        <RadioCard
          id="avalara-yes"
          name="avalara-account"
          value="yes"
          checked={hasAccount === true}
          title="Yes, I have an Avalara account"
          description="Connect your existing account to sync your tax compliance settings."
          onChange={handleChange}
        />
        <RadioCard
          id="avalara-no"
          name="avalara-account"
          value="no"
          checked={hasAccount === false}
          title="No, I don't have an account"
          description="We'll create a new Avalara account using the information you've provided."
          onChange={handleChange}
        />
      </div>
    </OnboardingLayout>
  )
}
