const TASK_ITEMS = [
  {
    icon: "user_account",
    title: "Personal Info",
    description: "Confirm your personal and contact information.",
  },
  {
    icon: "building_corporate",
    title: "Company",
    description: "Tell us all about your company.",
  },
  {
    icon: "document",
    title: "Tax Info",
    description: "Tell us about your company's tax information.",
  },
  {
    icon: "location_point",
    title: "Location",
    description: "Tell us where your company is located.",
  },
];

export default function WelcomeStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-bold text-foreground tracking-tight">
          Welcome to Trimble Financials
        </div>
        <div className="text-base font-semibold text-foreground leading-snug">
          We'll get you set up after taking these four easy steps.
        </div>
      </div>

      <div className="flex flex-col gap-3" role="list">
        {TASK_ITEMS.map((item) => (
          <div
            key={item.title}
            role="listitem"
            className="flex items-center gap-3.5 px-4 py-3.5 bg-background border border-default rounded-lg"
          >
            <div className="shrink-0 w-10 h-10 flex items-center justify-center text-foreground">
              <i className="modus-icons text-2xl">{item.icon}</i>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-base text-foreground mb-0.5">{item.title}</div>
              <div className="text-sm text-foreground-60 leading-snug">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
