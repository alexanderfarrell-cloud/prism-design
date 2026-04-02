import ModusTextInput from "../../../../components/ModusTextInput";
import ModusTooltip from "../../../../components/ModusTooltip";
import WizardStepLayout from "../WizardStepLayout";

interface CompanyInfoStepProps {
  companyName: string;
  entityType: string;
  ein: string;
  onUpdate: (field: string, value: string) => void;
}

const ENTITY_TYPES = [
  { label: "Sole Proprietorship", value: "sole_proprietorship" },
  { label: "LLC", value: "llc" },
  { label: "S-Corporation", value: "s_corp" },
  { label: "C-Corporation", value: "c_corp" },
  { label: "Partnership", value: "partnership" },
];

export default function CompanyInfoStep({
  companyName,
  entityType,
  ein,
  onUpdate,
}: CompanyInfoStepProps) {
  return (
    <WizardStepLayout
      title="Confirm your company details"
      subtitle="We pulled this from your Trimble Financials account. If anything looks wrong, contact support to update it."
    >
      <div>
        <ModusTextInput
          label="Company Name"
          value={companyName}
          readOnly
          aria-label="Company name"
        />
      </div>

      <div>
        <div className="text-sm font-bold text-foreground-60 mb-2 px-1">
          Type of Company
        </div>
        <div className="flex flex-col gap-2">
          {ENTITY_TYPES.map((type) => (
            <div
              key={`entity-${type.value}`}
              role="button"
              tabIndex={0}
              className={`flex items-center gap-3 px-4 py-3 rounded border cursor-pointer transition-colors ${
                entityType === type.value
                  ? "border-primary bg-primary-20"
                  : "border-default hover:bg-muted"
              }`}
              onClick={() => onUpdate("entityType", type.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onUpdate("entityType", type.value);
                }
              }}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  entityType === type.value
                    ? "border-primary"
                    : "border-foreground-40"
                }`}
              >
                {entityType === type.value && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="text-sm text-foreground">{type.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-bold text-foreground-60 px-1">
            Employer Identification Number (EIN)
          </div>
          <ModusTooltip content="This is your company's federal tax ID. It was assigned by the IRS when you registered your business. We keep it locked to prevent errors.">
            <i className="modus-icons text-sm text-foreground-40 cursor-help">
              info
            </i>
          </ModusTooltip>
        </div>
        <ModusTextInput
          value={ein}
          readOnly
          aria-label="Employer Identification Number"
        />
      </div>
    </WizardStepLayout>
  );
}
