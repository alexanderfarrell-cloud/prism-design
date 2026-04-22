import { ModusWcTextInput } from '@trimble-oss/moduswebcomponents-react'
import OnboardingLayout from '../components/OnboardingLayout'
import BottomBar from '../components/BottomBar'
import InfoBanner from '../components/InfoBanner'
import type { FormData, StepInfo } from '../types'

interface AvalaraCredentialsPageProps {
  formData: FormData
  onUpdate: (patch: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
  stepInfo: StepInfo
}

export default function AvalaraCredentialsPage({
  formData,
  onUpdate,
  onNext,
  onBack,
  stepInfo,
}: AvalaraCredentialsPageProps) {
  return (
    <OnboardingLayout
      bottomBar={<BottomBar onBack={onBack} onNext={onNext} stepInfo={stepInfo} />}
    >
      <h1 className="ob-title">Welcome to Trimble Financials</h1>
      <p className="ob-subtitle">Enter your Avalara login details so we can locate your account.</p>

      <div className="ob-form">
        <div className="ob-field">
          <p className="ob-label">Avalara Username</p>
          <ModusWcTextInput
            value={formData.avalaraUsername}
            type="email"
            onInputChange={(e: CustomEvent) =>
              onUpdate({ avalaraUsername: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>

        <div className="ob-field">
          <p className="ob-label">Avalara Account ID</p>
          <ModusWcTextInput
            value={formData.avalaraAccountId}
            onInputChange={(e: CustomEvent) =>
              onUpdate({ avalaraAccountId: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>

        <InfoBanner>
          Your Account ID can be found in your Avalara portal under{' '}
          <strong>Settings &gt; Account</strong>.
        </InfoBanner>
      </div>
    </OnboardingLayout>
  )
}
