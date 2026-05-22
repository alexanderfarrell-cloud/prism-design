interface ReviewStepProps {
  companyName: string;
  entityType: string;
  ein: string;
  suiId: string;
  suiRate: string;
  nexusJurisdictionName: string;
  nexusJurisdictionCode: string;
  payFrequency: "weekly" | "biweekly";
  firstWorkDate: string;
  accountType: "checking" | "savings";
  routingNumber: string;
  employeeFirstName: string;
  employeeLastName: string;
  employeePayType: "hourly" | "salary";
  employeePayRate: string;
}

const ENTITY_LABELS: Record<string, string> = {
  sole_proprietorship: "Sole Proprietorship",
  llc: "LLC",
  s_corp: "S-Corporation",
  c_corp: "C-Corporation",
  partnership: "Partnership",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "Not set";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function maskAccountNumber(num: string): string {
  if (num.length <= 4) return num;
  return "****" + num.slice(-4);
}

function formatNexusJurisdictionLine(name: string, code: string): string {
  if (name && code) return `${name} (${code})`;
  return name || code || "—";
}

interface SummaryCardProps {
  icon: string;
  title: string;
  items: { label: string; value: string }[];
}

function SummaryCard({ icon, title, items }: SummaryCardProps) {
  return (
    <div className="bg-card border-default rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <i className="modus-icons text-lg text-primary">{icon}</i>
        <div className="text-sm font-bold text-foreground">{title}</div>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={`review-${item.label}`} className="flex justify-between">
            <div className="text-sm text-foreground-60">{item.label}</div>
            <div className="text-sm font-bold text-foreground">
              {item.value || "--"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReviewStep(props: ReviewStepProps) {
  const stateTaxItems: { label: string; value: string }[] = [
    { label: "SUI ID", value: props.suiId || "Not provided yet" },
    {
      label: "SUI Rate",
      value: props.suiRate ? `${props.suiRate}%` : "Not provided yet",
    },
  ];
  if (props.nexusJurisdictionName || props.nexusJurisdictionCode) {
    stateTaxItems.push(
      {
        label: "Avalara nexus (state)",
        value: formatNexusJurisdictionLine(
          props.nexusJurisdictionName,
          props.nexusJurisdictionCode
        ),
      },
      { label: "Tax type", value: "Sales & Use Tax" },
      { label: "Nexus status", value: "Active in Avalara" }
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full px-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center mb-4">
          <i className="modus-icons text-3xl text-primary-foreground">check</i>
        </div>
        <div className="text-2xl text-foreground mb-2">You're all set!</div>
        <div className="text-base text-foreground-60 text-center">
          Here's a summary of your payroll setup. You can change any of these
          later in Payroll Settings.
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SummaryCard
          icon="briefcase"
          title="Company"
          items={[
            { label: "Name", value: props.companyName },
            {
              label: "Type",
              value: ENTITY_LABELS[props.entityType] || props.entityType,
            },
            { label: "EIN", value: props.ein },
          ]}
        />

        <SummaryCard
          icon="file_secure"
          title="State Taxes"
          items={stateTaxItems}
        />

        <SummaryCard
          icon="calendar"
          title="Pay Schedule"
          items={[
            {
              label: "Frequency",
              value: props.payFrequency === "weekly" ? "Weekly" : "Every Two Weeks",
            },
            {
              label: "First Pay Period",
              value: formatDate(props.firstWorkDate),
            },
          ]}
        />

        <SummaryCard
          icon="credit_card"
          title="Bank Account"
          items={[
            {
              label: "Type",
              value:
                props.accountType === "checking" ? "Checking" : "Savings",
            },
            {
              label: "Account",
              value: maskAccountNumber(props.routingNumber),
            },
          ]}
        />

        <SummaryCard
          icon="person"
          title="First Team Member"
          items={[
            {
              label: "Name",
              value: `${props.employeeFirstName} ${props.employeeLastName}`.trim() || "--",
            },
            {
              label: "Pay Type",
              value: props.employeePayType === "hourly" ? "Hourly" : "Salary",
            },
            {
              label: "Rate",
              value: props.employeePayRate
                ? props.employeePayType === "hourly"
                  ? `$${props.employeePayRate}/hr`
                  : `$${props.employeePayRate}/yr`
                : "--",
            },
          ]}
        />
      </div>

      <div className="bg-card border-default rounded-lg p-4 flex items-start gap-3 mt-6">
        <i className="modus-icons text-lg text-primary flex-shrink-0 mt-0.5">
          info
        </i>
        <div className="text-sm text-foreground-60">
          Once you continue, we'll start verifying your bank account. You'll
          receive two small deposits within 1-2 business days. Come back to
          confirm the amounts and you'll be ready to run your first payroll.
        </div>
      </div>
    </div>
  );
}
