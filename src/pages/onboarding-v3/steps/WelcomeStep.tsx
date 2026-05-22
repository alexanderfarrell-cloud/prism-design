import { useState } from "react";

const SETUP_STEPS = [
  {
    number: 1,
    title: "Personal Info",
    description: "Confirm your personal and contact information.",
  },
  {
    number: 2,
    title: "Company",
    description: "Tell us all about your company.",
  },
  {
    number: 3,
    title: "Location",
    description: "Tell us where your company is located.",
  },
  {
    number: 4,
    title: "Tax Info",
    description: "Tell us about your company's tax information.",
  },
];

const CHECKLIST_ITEMS = [
  "Your government-issued ID",
  "Your company's legal name and address",
  "Federal Employer Identification Number (EIN)",
  "Your business bank account details",
];

export default function WelcomeStep() {
  const [checklistOpen, setChecklistOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* Page title + subtitle */}
      <div className="flex flex-col gap-1.5">
        <div className="text-2xl font-bold text-foreground tracking-tight">
          Welcome to Trimble Financials
        </div>
        <div className="text-sm text-muted-foreground">
          We'll get you set up after taking these four easy steps.
        </div>
      </div>

      {/* Step list */}
      <div className="flex flex-col px-4">
        {SETUP_STEPS.map((step, index) => (
          <div key={step.number}>
            {/* Step row */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <div className="text-sm font-bold text-primary-foreground leading-none">
                  {step.number}
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </div>
              </div>
            </div>
            {/* Connector line between steps */}
            {index < SETUP_STEPS.length - 1 && (
              <div className="ml-4 w-0.5 h-7 bg-muted-foreground-40" />
            )}
          </div>
        ))}
      </div>

      {/* Have these ready accordion */}
      <div className="border-default rounded-lg overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          className="w-full flex items-center justify-between px-4 py-3 bg-background hover:bg-accent cursor-pointer transition-colors"
          onClick={() => setChecklistOpen((prev) => !prev)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setChecklistOpen((prev) => !prev); }}}
          aria-expanded={checklistOpen}
        >
          <div className="text-sm font-medium text-foreground">
            Have these ready to speed things up
          </div>
          <i
            className={`modus-icons text-base text-muted-foreground transition-transform duration-200${
              checklistOpen ? " rotate-180" : ""
            }`}
          >
            expand_more
          </i>
        </div>

        {checklistOpen && (
          <div className="border-top-default bg-background px-4 py-4">
            <div className="flex flex-col gap-3">
              {CHECKLIST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <i className="modus-icons text-base text-primary flex-shrink-0">
                    check_circle
                  </i>
                  <div className="text-sm text-foreground">{item}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
