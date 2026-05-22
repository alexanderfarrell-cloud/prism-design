const COMPLETED_STEPS = [
  {
    number: 1,
    title: "Personal Info",
    description: "Confirmed your personal and contact information.",
  },
  {
    number: 2,
    title: "Company",
    description: "Told us all about your company.",
  },
  {
    number: 3,
    title: "Location",
    description: "Confirmed where your business operates.",
  },
];

export default function ProfileCompleteStep() {
  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col gap-1.5">
        <div className="text-2xl font-bold text-foreground tracking-tight">
          Your profile is complete
        </div>
        <div className="text-sm text-muted-foreground">
          Great work — you've finished the profile steps. One section left to go.
        </div>
      </div>

      {/* Completed steps */}
      <div className="flex flex-col">
        {COMPLETED_STEPS.map((step) => (
          <div
            key={step.number}
            className="flex items-center gap-4 px-4 py-4"
          >
            {/* Success circle */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success flex items-center justify-center">
              <i className="modus-icons text-sm text-primary-foreground leading-none">check</i>
            </div>

            {/* Text */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {step.title}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* What's next divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-bottom-default" />
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          What's next
        </div>
        <div className="flex-1 border-bottom-default" />
      </div>

      {/* Tax Setup CTA row */}
      <div className="flex items-center gap-4 px-4 py-4 bg-background rounded-lg">
        {/* Number badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <div className="text-sm font-bold text-primary-foreground leading-none">4</div>
        </div>

        {/* Text */}
        <div className="flex flex-col flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground">
          Tax Info
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Provide your company's tax information and connect your sales tax compliance.
        </div>
        </div>

      </div>
    </div>
  );
}
