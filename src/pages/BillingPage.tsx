import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import ModusTabs from "../components/ModusTabs";
import ModusTextInput from "../components/ModusTextInput";
import ModusButton from "../components/ModusButton";

type BillingStatus = "past_due" | "pending";

interface Billing {
  name: string;
  referenceNumber: string;
  date: string;
  amount: string;
  customer: string;
  status: BillingStatus;
}

const ACTIVE_BILLINGS: Billing[] = [
  {
    name: "Chair Repair",
    referenceNumber: "#3259-1001",
    date: "February 23, 2026",
    amount: "$2,300.00",
    customer: "P-Hut",
    status: "past_due",
  },
  {
    name: "Jorge job cost",
    referenceNumber: "#2416-1045",
    date: "March 25, 2026",
    amount: "$70.00",
    customer: "Jocabrera",
    status: "pending",
  },
  {
    name: "Pizza Cutter repair",
    referenceNumber: "#3258-1001",
    date: "February 23, 2026",
    amount: "$10.50",
    customer: "P-Hut",
    status: "past_due",
  },
  {
    name: "DER RIESE",
    referenceNumber: "#INV-657879",
    date: "February 23, 2026",
    amount: "$1,000.00",
    customer: "RICARDO SINAI MIRANDA P1",
    status: "past_due",
  },
  {
    name: "DER RIESE",
    referenceNumber: "#INV-168791",
    date: "February 23, 2026",
    amount: "$1,000.00",
    customer: "RICARDO SINAI MIRANDA P1",
    status: "past_due",
  },
  {
    name: "DER RIESE",
    referenceNumber: "#2918-1002",
    date: "February 19, 2026",
    amount: "$400.00",
    customer: "RICARDO SINAI MIRANDA P1",
    status: "past_due",
  },
  {
    name: "DER RIESE",
    referenceNumber: "#2918-1001",
    date: "February 19, 2026",
    amount: "$4,400.00",
    customer: "RICARDO SINAI MIRANDA P1",
    status: "past_due",
  },
  {
    name: "string",
    referenceNumber: "#3234-1002",
    date: "February 18, 2026",
    amount: "$1,146.00",
    customer: "Anderssen Builders",
    status: "past_due",
  },
  {
    name: "string",
    referenceNumber: "#3234-1001",
    date: "February 18, 2026",
    amount: "$150.00",
    customer: "Anderssen Builders",
    status: "past_due",
  },
  {
    name: "Chicago Style Deep Fryer Addition",
    referenceNumber: "#3193-1024",
    date: "March 12, 2026",
    amount: "$82.00",
    customer: "P-Hut",
    status: "pending",
  },
  {
    name: "Jorge job cost",
    referenceNumber: "#2416-1044",
    date: "March 25, 2026",
    amount: "$55.00",
    customer: "Jocabrera",
    status: "pending",
  },
  {
    name: "Chicago Style Deep Fryer Addition",
    referenceNumber: "#3193-1005",
    date: "March 12, 2026",
    amount: "$120.00",
    customer: "P-Hut",
    status: "pending",
  },
];

const STATUS_STYLES: Record<BillingStatus, string> = {
  past_due: "bg-destructive text-destructive-foreground",
  pending: "border-default text-foreground bg-background",
};

const STATUS_LABELS: Record<BillingStatus, string> = {
  past_due: "Past Due",
  pending: "Pending",
};

function StatusBadge({ status }: { status: BillingStatus }) {
  return (
    <div
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </div>
  );
}

function BillingCard({ billing }: { billing: Billing }) {
  return (
    <div className="bg-background border-default rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-base font-bold text-foreground pr-4 truncate">
          {billing.name}
        </div>
        <ModusButton
          icon="more_vertical"
          iconPosition="only"
          variant="borderless"
          size="sm"
          ariaLabel="more_vertical"
        />
      </div>

      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-1">
        <i className="modus-icons text-sm text-foreground-60">invoice</i>
        <div>{billing.referenceNumber}</div>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-4">
        <i className="modus-icons text-sm text-foreground-60">calendar</i>
        <div>{billing.date}</div>
      </div>

      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-foreground-60">Amount</div>
        <div className="text-base font-bold text-foreground">
          {billing.amount}
        </div>
      </div>

      <div className="border-bottom-default mb-3" />

      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-foreground-60">Customer</div>
          <div className="text-sm font-bold text-foreground truncate max-w-[200px]">
            {billing.customer}
          </div>
        </div>
        <StatusBadge status={billing.status} />
      </div>
    </div>
  );
}

function EmptyTabContent({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-foreground-60">
      <i className="modus-icons text-4xl mb-3">monetarization</i>
      <div className="text-lg">No {label} billings</div>
    </div>
  );
}

export default function BillingPage() {
  usePageTitle("Billing");
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const filteredBillings = useMemo(() => {
    if (!searchValue.trim()) return ACTIVE_BILLINGS;
    const query = searchValue.toLowerCase();
    return ACTIVE_BILLINGS.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.referenceNumber.toLowerCase().includes(query) ||
        b.customer.toLowerCase().includes(query),
    );
  }, [searchValue]);

  const handleSearchChange = (event: CustomEvent<InputEvent>) => {
    const target = event.target as HTMLInputElement;
    setSearchValue(target.value || "");
  };

  const tabs = [
    { label: "Active" },
    { label: "Drafts" },
    { label: "Archived" },
  ];

  const panels = [
    <div key="active" className="pt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <ModusTextInput
            placeholder="Search"
            includeSearch
            includeClear={!!searchValue}
            value={searchValue}
            onInputChange={handleSearchChange}
            aria-label="Search"
            size="md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4 max-h-[calc(100vh-310px)]">
        {filteredBillings.map((billing, index) => (
          <BillingCard
            key={`billing-${billing.referenceNumber}-${index}`}
            billing={billing}
          />
        ))}
        {filteredBillings.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-foreground-60">
            <i className="modus-icons text-4xl mb-3">search</i>
            <div className="text-lg">No billings found</div>
          </div>
        )}
      </div>
    </div>,
    <EmptyTabContent key="drafts" label="draft" />,
    <EmptyTabContent key="archived" label="archived" />,
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col px-6 pt-6 overflow-hidden max-w-6xl mx-auto w-full">
        <div className="text-2xl text-foreground mb-4">Billing Hub</div>

        <div className="flex-1 min-h-0">
          <div className="w-full">
            <ModusTabs
              tabs={tabs}
              panels={panels}
              activeTabIndex={activeTab}
              onTabChange={({ newTab }) => setActiveTab(newTab)}
              ariaLabel="Billing status tabs"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-top-default bg-background max-w-6xl mx-auto w-full">
        <ModusButton
          variant="borderless"
          color="primary"
          size="md"
          onButtonClick={() => navigate("/")}
        >
          Back to Dashboard
        </ModusButton>
        <ModusButton
          color="primary"
          variant="filled"
          size="md"
          icon="add"
          iconPosition="left"
        >
          Add Billing
        </ModusButton>
      </div>
    </div>
  );
}
