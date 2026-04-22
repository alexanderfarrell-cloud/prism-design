import { ModusWcTextInput, ModusWcCheckbox } from '@trimble-oss/moduswebcomponents-react'
import OnboardingLayout from '../components/OnboardingLayout'
import BottomBar from '../components/BottomBar'
import InfoBanner from '../components/InfoBanner'
import type { FormData, StepInfo } from '../types'

interface LocationPageProps {
  formData: FormData
  onUpdate: (patch: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
  stepInfo: StepInfo
}

export default function LocationPage({
  formData,
  onUpdate,
  onNext,
  onBack,
  stepInfo,
}: LocationPageProps) {
  return (
    <OnboardingLayout
      bottomBar={<BottomBar onBack={onBack} onNext={onNext} stepInfo={stepInfo} />}
    >
      <h1 className="ob-title">Welcome to Trimble Financials</h1>
      <p className="ob-subtitle">Where does your business operate?</p>

      <div className="ob-form">
        <div className="ob-field">
          <p className="ob-label">Address</p>
          <ModusWcTextInput
            value={formData.address}
            onInputChange={(e: CustomEvent) =>
              onUpdate({ address: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>

        <div className="ob-field">
          <p className="ob-label">State</p>
          <ModusWcTextInput
            value={formData.state}
            onInputChange={(e: CustomEvent) =>
              onUpdate({ state: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>

        <div className="ob-field">
          <p className="ob-label">City</p>
          <ModusWcTextInput
            value={formData.city}
            onInputChange={(e: CustomEvent) =>
              onUpdate({ city: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>

        <div className="ob-field">
          <p className="ob-label">Zip Code</p>
          <ModusWcTextInput
            value={formData.zipCode}
            onInputChange={(e: CustomEvent) =>
              onUpdate({ zipCode: (e.detail as { target?: { value?: string } })?.target?.value ?? '' })
            }
          />
        </div>

        <div className="ob-checkbox-row">
          <ModusWcCheckbox
            value={formData.billingAddressSame}
            label="Billing address is the same"
            onInputChange={(e: CustomEvent) =>
              onUpdate({ billingAddressSame: e.detail as boolean })
            }
          />
        </div>

        <InfoBanner>
          Avalara will use your state and county to determine your sales tax nexus obligations.
        </InfoBanner>
      </div>
    </OnboardingLayout>
  )
}
