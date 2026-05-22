import { useState } from "react";
import ModusTextInput from "../../../components/ModusTextInput";

export default function TaxLocationStep() {
  const [billingIsSame, setBillingIsSame] = useState(true);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-sm text-foreground-60 -mt-2">Where does your business operate?</div>

      <ModusTextInput label="Address" value="4521 Oak Ridge Dr" readOnly inputId="demo-tax-address" />
      <ModusTextInput label="State" value="Texas" readOnly inputId="demo-state" />
      <ModusTextInput label="City" value="Austin" readOnly inputId="demo-city" />
      <ModusTextInput label="Zip Code" value="78745" readOnly inputId="demo-zip" />

      <div
        role="checkbox"
        aria-checked={billingIsSame}
        tabIndex={0}
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => setBillingIsSame((v) => !v)}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setBillingIsSame((v) => !v); }}}
      >
        <div className={`w-5 h-5 rounded shrink-0 border-2 flex items-center justify-center transition-colors ${billingIsSame ? "bg-primary border-primary" : "bg-background border-default"}`}>
          {billingIsSame && <i className="modus-icons text-primary-foreground text-sm leading-none">check</i>}
        </div>
        <div className="text-sm text-foreground">Billing address is the same</div>
      </div>

      {!billingIsSame && (
        <div className="flex flex-col gap-5">
          <div className="text-sm font-semibold text-foreground">Billing address</div>
          <ModusTextInput label="Address" inputId="demo-billing-address" />
          <ModusTextInput label="State" inputId="demo-billing-state" />
          <ModusTextInput label="City" inputId="demo-billing-city" />
          <ModusTextInput label="Zip Code" inputId="demo-billing-zip" />
        </div>
      )}

      <div className="flex items-start gap-3 rounded-lg bg-primary-20 border border-primary px-4 py-3">
        <i className="modus-icons text-primary text-lg leading-none mt-0.5">info</i>
        <div className="text-sm text-foreground">
          Avalara will use your state and county to determine your sales tax nexus obligations.
        </div>
      </div>
    </div>
  );
}
