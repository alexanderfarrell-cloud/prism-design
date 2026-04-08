import { ModusWcTextInput } from '@trimble-oss/moduswebcomponents-react'
import { TrimbleLogoRow } from './TrimbleBranding'

/** Second screen — personal information (matches mobile onboarding reference). */
export function PersonalInfoStep() {
  return (
    <div className="text-left text-foreground">
      <div className="mb-6">
        <TrimbleLogoRow />
      </div>
      <h1 className="m-0 mb-2 text-base font-medium text-foreground leading-snug">
        Welcome to Trimble Financials
      </h1>
      <h2 className="m-0 mb-6 text-base font-bold text-foreground leading-snug">
        Confirm your personal information
      </h2>
      <div className="flex flex-col gap-4">
        <ModusWcTextInput
          input-id="sandbox-first-name"
          label="First Name"
          value="John"
          read-only
          bordered={false}
        />
        <ModusWcTextInput
          input-id="sandbox-last-name"
          label="Last Name"
          value="Smith"
          read-only
          bordered={false}
        />
        <div
          className="rounded-lg border-l-4 border-l-primary border border-default bg-primary/5 px-3 py-3 text-sm leading-snug"
          role="note"
        >
          <div className="font-semibold text-foreground">Use your Avalara email</div>
          <p className="m-0 mt-2 text-foreground-60">
            Enter the <span className="font-semibold text-foreground">same email address</span> you use for
            your <span className="font-semibold text-foreground">Avalara</span> account. That lets us find your
            existing profile and link it to Trimble Financials—so we don&apos;t create a second account for you.
          </p>
        </div>
        <ModusWcTextInput
          input-id="sandbox-email"
          label="Email"
          type="email"
          placeholder="Same email as your Avalara login"
        />
        <ModusWcTextInput
          input-id="sandbox-phone"
          label="Phone Number"
          type="tel"
          value="+1 (123) 456-7890"
          read-only
          bordered={false}
        />
      </div>
    </div>
  )
}
