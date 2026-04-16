export interface Company {
  id: string;
  name: string;
  accountId: string;
  location: string;
}

export const DEMO_COMPANIES: Company[] = [
  { id: "1", name: "Farrell Construction LLC", accountId: "2109384756", location: "Austin, TX" },
  { id: "2", name: "Farrell Roofing Inc.", accountId: "2109384756", location: "Houston, TX" },
  { id: "3", name: "FC Holding Group", accountId: "2109384756", location: "Dallas, TX" },
];

interface AvalaraCompanySelectStepProps {
  selectedCompanyId: string | null;
  onSelect: (id: string) => void;
}

export default function AvalaraCompanySelectStep({ selectedCompanyId, onSelect }: AvalaraCompanySelectStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-sm text-foreground-60 -mt-2">
        We found the following companies linked to your Avalara account. Select the one you want to use for onboarding.
      </div>

      <div className="flex flex-col gap-3">
        {DEMO_COMPANIES.map((company) => {
          const isSelected = selectedCompanyId === company.id;
          return (
            <div
              key={company.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(company.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(company.id); }}}
              className={`flex items-center justify-between rounded-xl border-2 px-4 py-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary-20"
                  : "border-default bg-background hover:border-primary"
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="text-sm font-semibold text-foreground">{company.name}</div>
                <div className="text-xs text-foreground-60">{company.location}</div>
                <div className="text-xs text-foreground-40">Account ID: {company.accountId}</div>
              </div>
              {isSelected && (
                <i className="modus-icons text-primary text-xl leading-none shrink-0">check_circle</i>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-muted px-4 py-3">
        <i className="modus-icons text-muted-foreground text-lg leading-none mt-0.5 shrink-0">info</i>
        <div className="text-sm text-foreground-60">
          Only companies linked to your Avalara account are shown. Contact support if your company is missing.
        </div>
      </div>
    </div>
  );
}
