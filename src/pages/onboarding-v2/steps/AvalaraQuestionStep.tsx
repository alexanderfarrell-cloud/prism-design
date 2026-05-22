interface AvalaraQuestionStepProps {
  selected: boolean | null;
  onSelect: (hasAccount: boolean) => void;
}

export default function AvalaraQuestionStep({ selected, onSelect }: AvalaraQuestionStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-bold text-foreground tracking-tight">
          Welcome to Trimble Financials
        </div>
        <div className="text-sm text-foreground-60 leading-relaxed">
          Trimble Financials uses Avalara to manage your sales tax compliance. To get started,
          let us know if you already have an Avalara account — we'll connect it automatically,
          or set one up for you as part of onboarding.
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect(true)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(true); }}}
          className={`flex items-start gap-4 rounded-xl border-2 p-5 cursor-pointer transition-all ${
            selected === true
              ? "border-primary bg-primary-20"
              : "border-default bg-background hover:border-primary"
          }`}
        >
          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            selected === true ? "border-primary" : "border-default"
          }`}>
            {selected === true && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold text-foreground">Yes, I have an Avalara account</div>
            <div className="text-sm text-foreground-60">
              Connect your existing account to import your company and tax settings.
            </div>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect(false)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(false); }}}
          className={`flex items-start gap-4 rounded-xl border-2 p-5 cursor-pointer transition-all ${
            selected === false
              ? "border-primary bg-primary-20"
              : "border-default bg-background hover:border-primary"
          }`}
        >
          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            selected === false ? "border-primary" : "border-default"
          }`}>
            {selected === false && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold text-foreground">No, continue with onboarding</div>
            <div className="text-sm text-foreground-60">
              We'll create a new Avalara account as part of your onboarding.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
