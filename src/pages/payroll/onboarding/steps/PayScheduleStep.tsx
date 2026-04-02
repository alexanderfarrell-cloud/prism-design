import ModusBadge from "../../../../components/ModusBadge";
import ModusDate from "../../../../components/ModusDate";
import WizardStepLayout from "../WizardStepLayout";

interface PayScheduleStepProps {
  payFrequency: "weekly" | "biweekly";
  firstWorkDate: string;
  onUpdate: (field: string, value: string) => void;
}

const FREQUENCY_OPTIONS = [
  {
    value: "weekly" as const,
    label: "Weekly",
    description: "Pay your team every week",
    recommended: true,
  },
  {
    value: "biweekly" as const,
    label: "Every Two Weeks",
    description: "Pay your team every other week",
    recommended: false,
  },
];

export default function PayScheduleStep({
  payFrequency,
  firstWorkDate,
  onUpdate,
}: PayScheduleStepProps) {
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  return (
    <WizardStepLayout
      title="How often do you want to pay your team?"
      subtitle="Most construction companies pay weekly -- it keeps crews happy and helps with cash flow."
    >
      <div className="flex flex-col gap-3">
        {FREQUENCY_OPTIONS.map((option) => (
          <div
            key={`freq-${option.value}`}
            role="button"
            tabIndex={0}
            className={`flex items-center justify-between px-4 py-4 rounded border cursor-pointer transition-colors ${
              payFrequency === option.value
                ? "border-primary bg-primary-20"
                : "border-default hover:bg-muted"
            }`}
            onClick={() => onUpdate("payFrequency", option.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onUpdate("payFrequency", option.value);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  payFrequency === option.value
                    ? "border-primary"
                    : "border-foreground-40"
                }`}
              >
                {payFrequency === option.value && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  {option.label}
                </div>
                <div className="text-xs text-foreground-60">
                  {option.description}
                </div>
              </div>
            </div>
            {option.recommended && (
              <ModusBadge color="primary" variant="outlined" size="sm">
                Recommended
              </ModusBadge>
            )}
          </div>
        ))}
      </div>

      <div>
        <ModusDate
          label="When does your first pay period start?"
          value={firstWorkDate}
          min={minDate}
          onInputChange={(e) => {
            const target = e.target as HTMLInputElement | null;
            if (target) onUpdate("firstWorkDate", target.value);
          }}
          aria-label="First work date"
        />
        <div className="text-xs text-foreground-40 mt-1 px-1">
          This is the first day your employees will start working under this
          payroll
        </div>
      </div>
    </WizardStepLayout>
  );
}
