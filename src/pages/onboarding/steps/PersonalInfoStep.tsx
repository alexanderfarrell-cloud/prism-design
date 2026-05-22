import ModusTextInput from "../../../components/ModusTextInput";
import ModusTooltip from "../../../components/ModusTooltip";

export default function PersonalInfoStep() {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-sm text-foreground-60 -mt-2">
        Confirm your personal information
      </div>

      <ModusTextInput label="First name" value="Alex" readOnly inputId="demo-first-name" />
      <ModusTextInput label="Last name" value="Rivera" readOnly inputId="demo-last-name" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <div className="text-sm font-medium text-foreground">Email</div>
          <ModusTooltip
            content="Use the same email as your Avalara login. This helps us link your accounts automatically."
            position="right"
          >
            <i className="modus-icons text-sm text-foreground-40 cursor-help">info</i>
          </ModusTooltip>
        </div>
        <ModusTextInput
          value="alex.rivera@trimble.com"
          readOnly
          inputId="demo-email"
          type="email"
        />
      </div>
      <ModusTextInput
        label="Phone number"
        value="(512) 555-0147"
        readOnly
        inputId="demo-phone"
        type="tel"
      />
      <ModusTextInput
        label="Address"
        value="4521 Oak Ridge Dr, Austin, TX 78745"
        readOnly
        inputId="demo-address"
      />
    </div>
  );
}
