function FieldLabel({ children }: { children: string }) {
  return (
    <div className="text-xs font-bold text-foreground mb-0.5">{children}</div>
  );
}

function FieldValue({ children }: { children: string }) {
  return (
    <div className="text-sm text-foreground">{children}</div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <FieldValue>{value}</FieldValue>
    </div>
  );
}

function ColumnFields({ fields }: { fields: { label: string; value: string }[] }) {
  return (
    <div className={`grid gap-3 mb-4`} style={{ gridTemplateColumns: `repeat(${fields.length}, 1fr)` }}>
      {fields.map((f) => (
        <div key={f.label}>
          <FieldLabel>{f.label}</FieldLabel>
          <FieldValue>{f.value}</FieldValue>
        </div>
      ))}
    </div>
  );
}

function MaskedField({ label, masked }: { label: string; masked: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-2">
      <div>
        <FieldLabel>{label}</FieldLabel>
        <FieldValue>{masked}</FieldValue>
      </div>
      <i className="modus-icons text-foreground-40 text-xl mb-0.5">visibility_off</i>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="text-base font-semibold text-primary underline cursor-default mb-3 mt-2">
      {label}
    </div>
  );
}

interface ReviewStepProps {
  companyName?: string;
  companyCity?: string;
  companyState?: string;
  fromAvalara?: boolean;
}

function inferCompanyType(name: string): string {
  const suffixes = ["LLC", "Inc.", "Inc", "Corp.", "Corp", "Ltd.", "Ltd", "LLP", "LP", "PC"];
  for (const suffix of suffixes) {
    if (name.endsWith(suffix) || name.endsWith(suffix.replace(".", ""))) {
      return suffix.endsWith(".") ? suffix : suffix;
    }
  }
  return "—";
}

export default function ReviewStep({ companyName, companyCity, companyState, fromAvalara }: ReviewStepProps) {
  const displayCompanyName = companyName ?? "Acme Construction LLC";
  const displayCompanyType = companyName ? inferCompanyType(companyName) : "LLC";
  const displayCity = companyCity ?? "Austin";
  const displayState = companyState ?? "TX";

  return (
    <div className="flex flex-col">
      <div className="text-2xl font-bold text-foreground mb-2 tracking-tight">
        Welcome to Trimble Financials
      </div>
      <div className="text-sm font-bold text-foreground mb-5 leading-snug">
        Review your information before submitting.
        Click on the headers you wish to edit.
      </div>

      {/* Avalara sync indicator */}
      {fromAvalara && (
        <div className="flex items-center gap-2.5 rounded-lg bg-success-20 border border-success px-4 py-3 mb-4">
          <i className="modus-icons text-success text-lg leading-none shrink-0">check_circle</i>
          <div className="text-sm text-foreground">
            Company details synced from your Avalara account.
          </div>
        </div>
      )}

      {/* Company */}
      <SectionHeader label="Company" />
      <Field label="Company Name" value={displayCompanyName} />
      <Field label="Company Type" value={displayCompanyType} />

      <div className="border-top-default mb-4" />

      {/* Tax Information */}
      <SectionHeader label="Tax Information" />
      <ColumnFields
        fields={[
          { label: "First Name", value: "Alex" },
          { label: "Middle Name", value: "—" },
          { label: "Last Name", value: "Rivera" },
        ]}
      />
      <Field label="Date of Birth" value="06/15/1988" />
      <MaskedField label="EIN" masked="*****4567" />

      <div className="border-top-default mb-4" />

      {/* Location */}
      <SectionHeader label="Location" />
      <Field label="Address" value="4521 Oak Ridge Dr" />
      <ColumnFields
        fields={[
          { label: "City", value: displayCity },
          { label: "State", value: displayState },
          { label: "Zip", value: "78745" },
        ]}
      />
    </div>
  );
}
