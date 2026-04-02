import ModusTextInput from "../../../../components/ModusTextInput";
import ModusTooltip from "../../../../components/ModusTooltip";
import WizardStepLayout from "../WizardStepLayout";

interface TaxSetupStepProps {
  suiId: string;
  suiRate: string;
  onUpdate: (field: string, value: string) => void;
}

export default function TaxSetupStep({
  suiId,
  suiRate,
  onUpdate,
}: TaxSetupStepProps) {
  return (
    <WizardStepLayout
      title="State tax information"
      subtitle="Since you're in Texas, there's no state income tax. We just need your unemployment insurance info."
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-bold text-foreground-60 px-1">
            State Unemployment Insurance (SUI) ID
          </div>
          <ModusTooltip content="This is the account number assigned to your business by the Texas Workforce Commission. You can find it on any TWC correspondence or your original registration letter.">
            <i className="modus-icons text-sm text-foreground-40 cursor-help">
              info
            </i>
          </ModusTooltip>
        </div>
        <ModusTextInput
          value={suiId}
          placeholder="e.g., 12-345678-9"
          onInputChange={(e) => {
            const target = e.target as HTMLInputElement | null;
            if (target) onUpdate("suiId", target.value);
          }}
          aria-label="State Unemployment Insurance ID"
        />
        <div className="text-xs text-foreground-40 mt-1 px-1">
          Found on your Texas Workforce Commission letter
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-bold text-foreground-60 px-1">
            Your SUI Tax Rate (%)
          </div>
          <ModusTooltip content="This is the percentage rate Texas charges you for unemployment insurance. New businesses typically start at 2.7%. You can find your exact rate on your TWC rate notice.">
            <i className="modus-icons text-sm text-foreground-40 cursor-help">
              info
            </i>
          </ModusTooltip>
        </div>
        <ModusTextInput
          value={suiRate}
          placeholder="e.g., 2.7"
          type="text"
          inputMode="decimal"
          onInputChange={(e) => {
            const target = e.target as HTMLInputElement | null;
            if (target) onUpdate("suiRate", target.value);
          }}
          aria-label="SUI Tax Rate"
        />
        <div className="text-xs text-foreground-40 mt-1 px-1">
          New employers in Texas typically start at 2.7%
        </div>
      </div>

      <div className="bg-card border-default rounded-lg p-4 flex items-start gap-3">
        <i className="modus-icons text-lg text-primary flex-shrink-0 mt-0.5">
          info
        </i>
        <div className="text-sm text-foreground-60">
          Don't have your SUI ID yet? You can skip this for now and add it later
          from Payroll Settings. However, you'll need it before running your
          first payroll.
        </div>
      </div>
    </WizardStepLayout>
  );
}
