const CHECKLIST_ITEMS = [
  {
    icon: "briefcase",
    text: "Your company's Federal Employer ID (EIN)",
  },
  {
    icon: "monetarization",
    text: "Your business bank account details",
  },
  {
    icon: "file_secure",
    text: "State Unemployment Insurance ID (if you have it)",
  },
  {
    icon: "person",
    text: "Basic info for at least one team member",
  },
];

export default function WelcomeStep() {
  return (
    <div className="max-w-xl mx-auto w-full px-6 flex flex-col items-center">
      <div className="w-full flex flex-col gap-3 mb-10">
        <div className="text-2xl text-foreground">
          Let's set up your payroll
        </div>
        <div className="text-base text-foreground-60">
          We'll walk you through a few simple steps so you can start paying your
          team. It only takes about 10 minutes.
        </div>
      </div>

      <div className="w-full bg-card border-default rounded-lg p-6 mb-8">
        <div className="text-sm font-bold text-foreground mb-4">
          Here's what you'll need handy:
        </div>
        <div className="flex flex-col gap-4">
          {CHECKLIST_ITEMS.map((item) => (
            <div
              key={`checklist-${item.icon}`}
              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <i className="modus-icons text-sm text-primary-foreground">
                  {item.icon}
                </i>
              </div>
              <div className="text-sm text-foreground">{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-foreground-40 text-center">
        Don't worry if you don't have everything right now. You can save your
        progress and come back anytime.
      </div>
    </div>
  );
}
