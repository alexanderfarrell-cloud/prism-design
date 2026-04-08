import { ModusWcTextInput } from '@trimble-oss/moduswebcomponents-react'
import type { StepId } from './stepConfig'
import { PersonalInfoStep } from './PersonalInfoStep'
import { WelcomeStep } from './WelcomeStep'

export function StepPanel({ stepId }: { stepId: StepId }) {
  switch (stepId) {
    case 'welcome':
      return <WelcomeStep />
    case 'personal':
      return <PersonalInfoStep />
    case 'company':
      return (
        <div className="flex flex-col gap-6">
          <ModusWcTextInput
            input-id="sandbox-company-name"
            label="Company name"
            placeholder="Acme Co."
            read-only
          />
          <ModusWcTextInput
            input-id="sandbox-industry"
            label="Industry"
            placeholder="Select or type…"
            read-only
          />
          <p className="m-0 text-sm text-muted-foreground">
            Replace fields when your assignment defines the real questions.
          </p>
        </div>
      )
    case 'team':
      return (
        <div className="flex flex-col gap-6">
          <ModusWcTextInput
            input-id="sandbox-team-size"
            label="How many people use Lista day to day?"
            placeholder="e.g. 12"
            read-only
          />
          <p className="m-0 text-sm text-muted-foreground">
            Wire real validation and options when the story is ready.
          </p>
        </div>
      )
    case 'done':
      return (
        <div className="flex flex-col gap-4 text-left">
          <p className="m-0 text-base text-foreground font-medium">Flow complete (prototype).</p>
          <p className="m-0 text-sm text-foreground-60">
            Next: paste learnings into Figma or ADO, or ask Cursor to port pieces into the main
            onboarding app.
          </p>
        </div>
      )
    default: {
      const _exhaustive: never = stepId
      return _exhaustive
    }
  }
}
