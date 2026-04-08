/** Welcome screen — aligned with Prism / Modus patterns (prototype). */

import { TrimbleLogoRow } from './TrimbleBranding'

function TaskCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div
      role="listitem"
      className="flex items-center gap-3.5 px-4 py-3.5 bg-card border-default rounded-lg"
    >
      <div className="shrink-0 w-10 h-10 flex items-center justify-center text-foreground">
        <i className="modus-icons text-2xl">{icon}</i>
      </div>
      <div className="min-w-0">
        <div className="font-bold text-base text-foreground mb-1">{title}</div>
        <p className="m-0 text-sm text-foreground-60 font-normal leading-snug">{description}</p>
      </div>
    </div>
  )
}

export function WelcomeStep() {
  return (
    <div className="text-left text-foreground">
      <header className="mb-6">
        <TrimbleLogoRow className="mb-5" />
        <h1 className="text-2xl font-bold text-foreground mb-3 tracking-tight m-0">
          Welcome to Trimble Financials
        </h1>
        <p className="text-base font-bold text-foreground m-0 leading-snug">
          We&apos;ll get you set up after taking these three easy steps.
        </p>
      </header>

      <div className="flex flex-col gap-3" role="list">
        <TaskCard
          icon="user_account"
          title="Personal Info"
          description="Confirm your personal and contact information"
        />
        <TaskCard
          icon="building_corporate"
          title="Company"
          description="Tell us all about your company."
        />
        <TaskCard
          icon="document"
          title="Tax Info"
          description="Tell us all about your company's Tax information."
        />
        <TaskCard
          icon="location_point"
          title="Location"
          description="Tell us where your company is located"
        />
      </div>
    </div>
  )
}
