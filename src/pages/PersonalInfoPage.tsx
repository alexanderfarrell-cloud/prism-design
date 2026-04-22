import { ModusWcTextInput } from '@trimble-oss/moduswebcomponents-react'
import OnboardingLayout from '../components/OnboardingLayout'
import BottomBar from '../components/BottomBar'
import type { FormData, StepInfo } from '../types'

interface PersonalInfoPageProps {
  formData: FormData
  onUpdate: (patch: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
  stepInfo: StepInfo
}

export default function PersonalInfoPage({
  formData,
  onUpdate,
  onNext,
  onBack,
  stepInfo,
}: PersonalInfoPageProps) {
  return (
    <OnboardingLayout
      bottomBar={<BottomBar onBack={onBack} onNext={onNext} stepInfo={stepInfo} />}
    >
      <h1 className="ob-title">Welcome to Trimble Financials</h1>
      <p className="ob-subtitle">Confirm your personal information</p>

      <div className="ob-form">
        <div className="ob-field">
          <p className="ob-label">First name</p>
          <ModusWcTextInput
            value={formData.firstName}
            onInputChange={(e: CustomEvent) =>
              onUpdate({ firstName: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>

        <div className="ob-field">
          <p className="ob-label">Last name</p>
          <ModusWcTextInput
            value={formData.lastName}
            onInputChange={(e: CustomEvent) =>
              onUpdate({ lastName: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>

        <div className="ob-field">
          <p className="ob-label">
            Email <span className="ob-info-icon" title="We'll use this to contact you">ⓘ</span>
          </p>
          <ModusWcTextInput
            value={formData.email}
            type="email"
            onInputChange={(e: CustomEvent) =>
              onUpdate({ email: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>

        <div className="ob-field">
          <p className="ob-label">Phone number</p>
          <ModusWcTextInput
            value={formData.phone}
            type="tel"
            onInputChange={(e: CustomEvent) =>
              onUpdate({ phone: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>
      </div>
    </OnboardingLayout>
  )
}
