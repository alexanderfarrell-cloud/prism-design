import ModusTextInput from "../../../components/ModusTextInput";

export default function AvalaraCredentialsStep() {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-sm text-foreground-60 -mt-2">
        Enter your Avalara login details so we can locate your account.
      </div>

      <ModusTextInput
        label="Avalara Username"
        value="alex.farrell@trimble.com"
        readOnly
        inputId="demo-avalara-username"
      />

      <ModusTextInput
        label="Avalara Account ID"
        value="2109384756"
        readOnly
        inputId="demo-avalara-account-id"
      />

      <div className="flex items-start gap-3 rounded-lg bg-primary-20 border border-primary px-4 py-3">
        <i className="modus-icons text-primary text-lg leading-none mt-0.5">info</i>
        <div className="text-sm text-foreground">
          Your Account ID can be found in your Avalara portal under <div className="inline font-semibold">Settings &gt; Account</div>.
        </div>
      </div>
    </div>
  );
}
