import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import ModusBadge from "../components/ModusBadge";
import type { ModusBadgeColor } from "../components/ModusBadge";
import ModusButton from "../components/ModusButton";
import ModusProgress from "../components/ModusProgress";
import welcomeIllustration from "../assets/welcome-illustration.svg";

interface JobItem {
  name: string;
  status: string;
  statusColor: ModusBadgeColor;
  statusVariant: "filled" | "outlined";
  location: string;
  dateRange: string;
  contractValue: string;
}

interface ExpenseItem {
  name: string;
  status: string;
  statusColor: ModusBadgeColor;
  statusVariant: "filled" | "outlined";
  category: string;
  date: string;
  type: string;
  amount: string;
}

interface BillingItem {
  name: string;
  status: string;
  statusColor: ModusBadgeColor;
  statusVariant: "filled" | "outlined";
  reference: string;
  date: string;
  amount: string;
}

const MOCK_JOBS: JobItem[] = [
  {
    name: "New home",
    status: "Draft",
    statusColor: "high-contrast",
    statusVariant: "filled",
    location: "Fo Ridge Road, Glenwood Springs, CO",
    dateRange: "February 24, 2026 - February 28, 2026",
    contractValue: "$100.00",
  },
  {
    name: "New building",
    status: "Proposal",
    statusColor: "secondary",
    statusVariant: "outlined",
    location: "County Road DDD, Mineral Point, WI",
    dateRange: "February 26, 2026 - February 28, 2026",
    contractValue: "$3,110.80",
  },
  {
    name: "estimate test2",
    status: "Draft",
    statusColor: "high-contrast",
    statusVariant: "filled",
    location: "123rd Avenue, 123, Anderson Island, WA",
    dateRange: "February 16, 2026 - February 23, 2026",
    contractValue: "$223.00",
  },
];

const MOCK_EXPENSES: ExpenseItem[] = [
  {
    name: "--",
    status: "Draft",
    statusColor: "high-contrast",
    statusVariant: "filled",
    category: "--",
    date: "Updated on February 24, 2026",
    type: "Invoice",
    amount: "$0.00",
  },
  {
    name: "--",
    status: "Draft",
    statusColor: "high-contrast",
    statusVariant: "filled",
    category: "--",
    date: "Updated on February 24, 2026",
    type: "Invoice",
    amount: "$510.00",
  },
  {
    name: "test cash customer openbalance",
    status: "Active",
    statusColor: "success",
    statusVariant: "filled",
    category: "Cash",
    date: "Transaction February 24, 2026",
    type: "",
    amount: "$15,000.00",
  },
];

const MOCK_BILLINGS: BillingItem[] = [
  {
    name: "MARCO HOME REMOCEL 0224",
    status: "Collected",
    statusColor: "success",
    statusVariant: "filled",
    reference: "ARP-1186",
    date: "Collected on February 24, 2026",
    amount: "$2,000.00",
  },
  {
    name: "All Hansd Demo - Proposal",
    status: "Collected",
    statusColor: "success",
    statusVariant: "filled",
    reference: "ARP-1185",
    date: "Collected on February 5, 2026",
    amount: "$100.00",
  },
  {
    name: "MARCO HOME REMOCEL 0224",
    status: "Collected",
    statusColor: "success",
    statusVariant: "filled",
    reference: "ARP-1184",
    date: "Collected on February 24, 2026",
    amount: "$5,000.00",
  },
];

interface GettingStartedItem {
  icon: string;
  title: string;
  description: string;
  badge: "Optional" | "Pending" | "Done";
  badgeColor: ModusBadgeColor;
  done?: boolean;
  route?: string;
}

const GETTING_STARTED_ITEMS: GettingStartedItem[] = [
  {
    icon: "earnings_statement",
    title: "Set Up Payroll",
    description:
      "Configure your payroll settings so you can start paying your employees on time.",
    badge: "Pending",
    badgeColor: "warning",
    route: "/payroll/setup",
  },
  {
    icon: "magic_wand",
    title: "Import Data",
    description:
      "Bring in your opening balances from a previous accounting system.",
    badge: "Done",
    badgeColor: "success",
    done: true,
  },
  {
    icon: "people_group",
    title: "Add Users",
    description:
      "Add new users, and assign licenses to them inside Trimble's Admin Console.",
    badge: "Optional",
    badgeColor: "secondary",
  },
  {
    icon: "location_point",
    title: "Add Job",
    description:
      "Add a new job or complete your existing draft to start building your main dashboard.",
    badge: "Done",
    badgeColor: "success",
    done: true,
  },
  {
    icon: "monetarization",
    title: "Add Billing",
    description:
      "Add a new billing or complete your existing draft to start building your main dashboard.",
    badge: "Done",
    badgeColor: "success",
    done: true,
  },
];

function GettingStartedRow({
  item,
  onNavigate,
}: {
  item: GettingStartedItem;
  onNavigate?: (route: string) => void;
}) {
  const handleClick = () => {
    if (!item.done && item.route && onNavigate) {
      onNavigate(item.route);
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 p-4 cursor-pointer hover:bg-muted transition-colors rounded ${item.done ? "opacity-60" : ""}`}
      onClick={handleClick}
      role={item.route && !item.done ? "link" : undefined}
      tabIndex={item.route && !item.done ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !item.done && item.route && onNavigate) {
          e.preventDefault();
          onNavigate(item.route);
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${item.done ? "bg-success" : "bg-primary"}`}>
          <i className="modus-icons text-xs text-primary-foreground">
            {item.done ? "check" : item.icon}
          </i>
        </div>
        <div className={`flex-1 text-sm font-bold ${item.done ? "line-through text-foreground-60" : "text-foreground"}`}>
          {item.title}
        </div>
        <ModusBadge color={item.badgeColor} variant="outlined" size="sm">
          {item.badge}
        </ModusBadge>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 text-sm text-foreground-60">
          {item.description}
        </div>
        {!item.done && (
          <i className="modus-icons text-foreground-40 flex-shrink-0">
            chevron_right
          </i>
        )}
      </div>
    </div>
  );
}

function GettingStartedWidget() {
  const navigate = useNavigate();
  const completedCount = GETTING_STARTED_ITEMS.filter((i) => i.done).length;
  const totalCount = GETTING_STARTED_ITEMS.length;
  const progressValue = (completedCount / totalCount) * 100;

  return (
    <div className="bg-background border-default rounded-lg p-2">
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-foreground">
            Getting Started
          </div>
          <ModusButton variant="borderless" color="primary" size="sm">
            Skip seeing this
          </ModusButton>
        </div>
        <div className="text-sm text-foreground">
          Lets get you setup to start using Financials Go
        </div>
        <ModusProgress
          value={progressValue}
          max={100}
          ariaLabel="Getting started progress"
        />
      </div>

      <div className="flex flex-col gap-0.5">
        {GETTING_STARTED_ITEMS.map((item) => (
          <GettingStartedRow
            key={`started-${item.title}`}
            item={item}
            onNavigate={(route) => navigate(route)}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="text-lg font-bold text-foreground">{title}</div>
        <i className="modus-icons text-2xl text-muted-foreground">{icon}</i>
      </div>
      <ModusButton variant="borderless" color="primary" size="sm">
        View All
      </ModusButton>
    </div>
  );
}

function JobCard({ job }: { job: JobItem }) {
  return (
    <div className="py-4 border-bottom-default last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold text-foreground">{job.name}</div>
        <ModusBadge
          color={job.statusColor}
          variant={job.statusVariant}
          size="sm"
        >
          {job.status}
        </ModusBadge>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-1">
        <i className="modus-icons text-sm">location_point</i>
        <div>{job.location}</div>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-3">
        <i className="modus-icons text-sm">calendar</i>
        <div>{job.dateRange}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-foreground-60">Contract Value</div>
        <div className="font-semibold text-foreground">{job.contractValue}</div>
      </div>
    </div>
  );
}

function ExpenseCard({ expense }: { expense: ExpenseItem }) {
  return (
    <div className="py-4 border-bottom-default last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold text-foreground">{expense.name}</div>
        <ModusBadge
          color={expense.statusColor}
          variant={expense.statusVariant}
          size="sm"
        >
          {expense.status}
        </ModusBadge>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-1">
        <i className="modus-icons text-sm">briefcase</i>
        <div>{expense.category}</div>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-1">
        <i className="modus-icons text-sm">calendar</i>
        <div>{expense.date}</div>
      </div>
      {expense.type && (
        <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-3">
          <i className="modus-icons text-sm">file</i>
          <div>{expense.type}</div>
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm text-foreground-60">Amount</div>
        <div className="font-semibold text-foreground">{expense.amount}</div>
      </div>
    </div>
  );
}

function BillingCard({ billing }: { billing: BillingItem }) {
  return (
    <div className="py-4 border-bottom-default last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold text-foreground">{billing.name}</div>
        <ModusBadge
          color={billing.statusColor}
          variant={billing.statusVariant}
          size="sm"
        >
          {billing.status}
        </ModusBadge>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-1">
        <i className="modus-icons text-sm">file</i>
        <div>{billing.reference}</div>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-3">
        <i className="modus-icons text-sm">calendar</i>
        <div>{billing.date}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-foreground-60">Amount</div>
        <div className="font-semibold text-foreground">{billing.amount}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  usePageTitle("Dashboard");
  return (
    <div className="p-6 max-w-6xl mx-auto h-full overflow-auto">
      {/* Greeting + Add button */}
      <div className="flex items-center justify-between mb-6">
        <div role="heading" aria-level={1} className="text-2xl text-foreground">Hello, Carlos Cuellar!</div>
        <ModusButton color="primary" size="md" icon="add" iconPosition="left">
          Add
        </ModusButton>
      </div>

      {/* Welcome banner */}
      <div className="flex items-center gap-6 mb-8">
        <div className="flex-shrink-0 w-28 h-28 rounded-lg flex items-center justify-center">
          <img src={welcomeIllustration} width="120" height="109" alt="Welcome illustration" />
        </div>
        <div>
          <div className="text-xl font-bold text-foreground mb-1">
            Welcome to Trimble Financials
          </div>
          <div className="text-foreground-60">
            You run the job. We'll run the numbers.
          </div>
        </div>
      </div>

      {/* Getting Started + Recent Jobs (two columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <GettingStartedWidget />

        {/* Recent Jobs */}
        <div className="bg-background border-default rounded-lg p-6">
          <SectionHeader title="Recent Jobs" icon="briefcase" />
          <div>
            {MOCK_JOBS.map((job, index) => (
              <JobCard key={`job-${job.name}-${index}`} job={job} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Expenses + Recent Billings (two columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background border-default rounded-lg p-6">
          <SectionHeader title="Recent Expenses" icon="costs" />
          <div>
            {MOCK_EXPENSES.map((expense, index) => (
              <ExpenseCard
                key={`expense-${expense.name}-${index}`}
                expense={expense}
              />
            ))}
          </div>
        </div>

        <div className="bg-background border-default rounded-lg p-6">
          <SectionHeader title="Recent Billings" icon="credit_card" />
          <div>
            {MOCK_BILLINGS.map((billing, index) => (
              <BillingCard
                key={`billing-${billing.name}-${index}`}
                billing={billing}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
