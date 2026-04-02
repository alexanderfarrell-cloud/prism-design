import ModusTextInput from "../../../../components/ModusTextInput";
import WizardStepLayout from "../WizardStepLayout";

interface AddEmployeeStepProps {
  employeeFirstName: string;
  employeeLastName: string;
  employeePayType: "hourly" | "salary";
  employeePayRate: string;
  onUpdate: (field: string, value: string) => void;
}

const PAY_TYPES = [
  {
    value: "hourly" as const,
    label: "Hourly",
    description: "Paid by the hour",
    icon: "clock",
  },
  {
    value: "salary" as const,
    label: "Salary",
    description: "Fixed annual pay",
    icon: "earnings_statement",
  },
];

export default function AddEmployeeStep({
  employeeFirstName,
  employeeLastName,
  employeePayType,
  employeePayRate,
  onUpdate,
}: AddEmployeeStepProps) {
  return (
    <WizardStepLayout
      title="Add your first team member"
      subtitle="Start with just one person -- you can add everyone else later."
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <ModusTextInput
            label="First Name"
            value={employeeFirstName}
            placeholder="First name"
            onInputChange={(e) => {
              const target = e.target as HTMLInputElement | null;
              if (target) onUpdate("employeeFirstName", target.value);
            }}
            aria-label="Employee first name"
          />
        </div>
        <div>
          <ModusTextInput
            label="Last Name"
            value={employeeLastName}
            placeholder="Last name"
            onInputChange={(e) => {
              const target = e.target as HTMLInputElement | null;
              if (target) onUpdate("employeeLastName", target.value);
            }}
            aria-label="Employee last name"
          />
        </div>
      </div>

      <div>
        <div className="text-sm font-bold text-foreground-60 mb-2 px-1">
          How is this person paid?
        </div>
        <div className="flex gap-3">
          {PAY_TYPES.map((type) => (
            <div
              key={`pay-${type.value}`}
              role="button"
              tabIndex={0}
              className={`flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded border cursor-pointer transition-colors ${
                employeePayType === type.value
                  ? "border-primary bg-primary-20"
                  : "border-default hover:bg-muted"
              }`}
              onClick={() => onUpdate("employeePayType", type.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onUpdate("employeePayType", type.value);
                }
              }}
            >
              <i
                className={`modus-icons text-2xl ${
                  employeePayType === type.value
                    ? "text-primary"
                    : "text-foreground-40"
                }`}
              >
                {type.icon}
              </i>
              <div>
                <div
                  className={`text-sm font-bold text-center ${
                    employeePayType === type.value
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {type.label}
                </div>
                <div className="text-xs text-foreground-60 text-center">
                  {type.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <ModusTextInput
          label={
            employeePayType === "hourly"
              ? "Hourly Rate ($)"
              : "Annual Salary ($)"
          }
          value={employeePayRate}
          placeholder={employeePayType === "hourly" ? "e.g., 25.00" : "e.g., 52000"}
          inputMode="decimal"
          onInputChange={(e) => {
            const target = e.target as HTMLInputElement | null;
            if (target) onUpdate("employeePayRate", target.value);
          }}
          aria-label="Pay rate"
        />
        {employeePayType === "hourly" && (
          <div className="text-xs text-foreground-40 mt-1 px-1">
            You can set different rates for field work vs. shop work later in
            Payroll Settings
          </div>
        )}
      </div>
    </WizardStepLayout>
  );
}
