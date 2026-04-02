import ModusTextInput from "../../../../components/ModusTextInput";
import ModusTooltip from "../../../../components/ModusTooltip";
import WizardStepLayout from "../WizardStepLayout";

interface BankAccountStepProps {
  routingNumber: string;
  accountNumber: string;
  accountType: "checking" | "savings";
  onUpdate: (field: string, value: string) => void;
}

const ACCOUNT_TYPES = [
  { value: "checking" as const, label: "Checking", icon: "credit_card" },
  { value: "savings" as const, label: "Savings", icon: "monetarization" },
];

export default function BankAccountStep({
  routingNumber,
  accountNumber,
  accountType,
  onUpdate,
}: BankAccountStepProps) {
  return (
    <WizardStepLayout
      title="Connect your bank account"
      subtitle="This is the account we'll use to fund payroll. We'll send two small deposits to verify it."
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-bold text-foreground-60 px-1">
            Routing Number
          </div>
          <ModusTooltip content="This is the 9-digit number on the bottom left of your checks. It identifies your bank. You can also find it in your online banking app.">
            <i className="modus-icons text-sm text-foreground-40 cursor-help">
              info
            </i>
          </ModusTooltip>
        </div>
        <ModusTextInput
          value={routingNumber}
          placeholder="9-digit routing number"
          inputMode="numeric"
          maxLength={9}
          onInputChange={(e) => {
            const target = e.target as HTMLInputElement | null;
            if (target) onUpdate("routingNumber", target.value);
          }}
          aria-label="Bank routing number"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-bold text-foreground-60 px-1">
            Account Number
          </div>
          <ModusTooltip content="Your account number is on the bottom of your checks, right after the routing number. It's usually 10-12 digits long.">
            <i className="modus-icons text-sm text-foreground-40 cursor-help">
              info
            </i>
          </ModusTooltip>
        </div>
        <ModusTextInput
          value={accountNumber}
          placeholder="Your account number"
          inputMode="numeric"
          onInputChange={(e) => {
            const target = e.target as HTMLInputElement | null;
            if (target) onUpdate("accountNumber", target.value);
          }}
          aria-label="Bank account number"
        />
      </div>

      <div>
        <div className="text-sm font-bold text-foreground-60 mb-2 px-1">
          Account Type
        </div>
        <div className="flex gap-3">
          {ACCOUNT_TYPES.map((type) => (
            <div
              key={`acct-${type.value}`}
              role="button"
              tabIndex={0}
              className={`flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded border cursor-pointer transition-colors ${
                accountType === type.value
                  ? "border-primary bg-primary-20"
                  : "border-default hover:bg-muted"
              }`}
              onClick={() => onUpdate("accountType", type.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onUpdate("accountType", type.value);
                }
              }}
            >
              <i
                className={`modus-icons text-2xl ${
                  accountType === type.value
                    ? "text-primary"
                    : "text-foreground-40"
                }`}
              >
                {type.icon}
              </i>
              <div
                className={`text-sm font-bold ${
                  accountType === type.value
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {type.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border-default rounded-lg p-4 flex items-start gap-3">
        <i className="modus-icons text-lg text-primary flex-shrink-0 mt-0.5">
          lock
        </i>
        <div className="text-sm text-foreground-60">
          Your bank details are encrypted and secure. After you submit, we'll
          send two small deposits (a few cents each) to verify your account.
          You'll enter those amounts in the next step.
        </div>
      </div>
    </WizardStepLayout>
  );
}
