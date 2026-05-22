import ModusTextInput from "../../../components/ModusTextInput";

export default function TaxDetailsStep() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="text-lg font-semibold text-foreground">State tax details</div>
        <div className="text-sm text-foreground-60">
          You may have received these when you registered your business with the state.
        </div>
      </div>

      <ModusTextInput
        label="State Unemployment Insurance ID (SUI)"
        value="TX-9982341"
        readOnly
        inputId="demo-sui-id"
      />
      <ModusTextInput
        label="SUI Rate (%)"
        value="2.70"
        readOnly
        inputId="demo-sui-rate"
      />
      <ModusTextInput
        label="State Withholding ID"
        value="TX-WH-447812"
        readOnly
        inputId="demo-withholding-id"
      />

      <div className="flex items-center gap-3 rounded-lg border border-default bg-card px-4 py-3 cursor-default">
        <div className="w-5 h-5 rounded border-2 border-foreground-40 flex items-center justify-center shrink-0">
        </div>
        <div className="text-sm text-foreground">I don't have this yet — skip for now</div>
      </div>
    </div>
  );
}
