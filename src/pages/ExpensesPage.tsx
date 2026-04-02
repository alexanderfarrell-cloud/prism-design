import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import ModusTabs from "../components/ModusTabs";
import ModusTextInput from "../components/ModusTextInput";
import ModusButton from "../components/ModusButton";

type ExpenseType = "cash" | "invoice";
type BadgeType = "unpaid" | "overhead";

interface Expense {
  name: string;
  type: ExpenseType;
  vendor?: string;
  date: string;
  amount: string;
  badges: BadgeType[];
}

const ACTIVE_EXPENSES: Expense[] = [
  {
    name: "test cash customer openbalance",
    type: "cash",
    date: "Transaction February 24, 2026",
    amount: "$15,000.00",
    badges: [],
  },
  {
    name: "check invoice fields",
    type: "invoice",
    vendor: "MARCOV",
    date: "Due on 2026-02-24",
    amount: "$1,500.00",
    badges: ["unpaid"],
  },
  {
    name: "Materials for Jon bathroom remodel",
    type: "invoice",
    vendor: "JoCabreraFinal",
    date: "Due on 2026-03-06",
    amount: "$10,000.00",
    badges: ["unpaid"],
  },
  {
    name: "active cash",
    type: "cash",
    date: "Transaction February 23, 2026",
    amount: "$240.00",
    badges: [],
  },
  {
    name: "posted tes",
    type: "invoice",
    vendor: "Moss Electric",
    date: "Due on 2026-02-26",
    amount: "$3,200.00",
    badges: ["unpaid"],
  },
  {
    name: "invoice",
    type: "invoice",
    vendor: "ALANV",
    date: "Due on 2026-02-23",
    amount: "$2,750.00",
    badges: ["unpaid"],
  },
  {
    name: "description 11",
    type: "invoice",
    vendor: "KMbappe10",
    date: "Due on 2026-02-27",
    amount: "$224.00",
    badges: ["unpaid"],
  },
  {
    name: "Prueba cash expense home",
    type: "cash",
    date: "Transaction February 19, 2026",
    amount: "$1,000.00",
    badges: ["overhead"],
  },
  {
    name: "123",
    type: "invoice",
    vendor: "--",
    date: "Due on 2026-02-18",
    amount: "$1,000.00",
    badges: ["unpaid"],
  },
  {
    name: "Draft #API-1313",
    type: "invoice",
    vendor: "--",
    date: "Due on 2026-02-19",
    amount: "$1,501.00",
    badges: ["unpaid"],
  },
  {
    name: "posted cash",
    type: "cash",
    date: "Transaction February 12, 2026",
    amount: "$250.00",
    badges: [],
  },
  {
    name: "posted invoice",
    type: "invoice",
    vendor: "--",
    date: "Due on 2026-02-14",
    amount: "$100.00",
    badges: ["unpaid"],
  },
  {
    name: "Prueba active invoices 10/02",
    type: "invoice",
    vendor: "--",
    date: "Due on 2026-02-11",
    amount: "$5,050.00",
    badges: ["unpaid", "overhead"],
  },
  {
    name: "Description testing",
    type: "invoice",
    vendor: "--",
    date: "Due on 2026-02-10",
    amount: "$800.00",
    badges: ["unpaid"],
  },
];

const BADGE_STYLES: Record<BadgeType, string> = {
  unpaid: "bg-warning text-warning-foreground",
  overhead: "bg-primary text-primary-foreground",
};

const BADGE_LABELS: Record<BadgeType, string> = {
  unpaid: "Unpaid",
  overhead: "Overhead",
};

function ExpenseBadge({ badge }: { badge: BadgeType }) {
  return (
    <div
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${BADGE_STYLES[badge]}`}
    >
      {BADGE_LABELS[badge]}
    </div>
  );
}

function ExpenseCard({ expense }: { expense: Expense }) {
  const isInvoice = expense.type === "invoice";

  return (
    <div className="bg-background border-default rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-base font-bold text-foreground pr-4 truncate">
          {expense.name}
        </div>
        {isInvoice && (
          <ModusButton
            icon="more_vertical"
            iconPosition="only"
            variant="borderless"
            size="sm"
            ariaLabel="more_vertical"
          />
        )}
      </div>

      {isInvoice && expense.vendor && (
        <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-1">
          <i className="modus-icons text-sm text-foreground-60">
            freight_market
          </i>
          <div>{expense.vendor}</div>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-1">
        <i className="modus-icons text-sm text-foreground-60">calendar</i>
        <div>{expense.date}</div>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-4">
        <i className="modus-icons text-sm text-foreground-60">
          {isInvoice ? "invoice" : "monetarization"}
        </i>
        <div>{isInvoice ? "Invoice" : "Cash"}</div>
      </div>

      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-foreground-60">Amount</div>
        <div className="text-base font-bold text-foreground">
          {expense.amount}
        </div>
      </div>

      <div className="border-bottom-default mb-3" />

      {expense.badges.length > 0 && (
        <div className="flex items-center gap-2">
          {expense.badges.map((badge) => (
            <ExpenseBadge key={`${expense.name}-${badge}`} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyTabContent({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-foreground-60">
      <i className="modus-icons text-4xl mb-3">submit_expense</i>
      <div className="text-lg">No {label} expenses</div>
    </div>
  );
}

export default function ExpensesPage() {
  usePageTitle("Expenses");
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const filteredExpenses = useMemo(() => {
    if (!searchValue.trim()) return ACTIVE_EXPENSES;
    const query = searchValue.toLowerCase();
    return ACTIVE_EXPENSES.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        (e.vendor && e.vendor.toLowerCase().includes(query)) ||
        e.date.toLowerCase().includes(query),
    );
  }, [searchValue]);

  const handleSearchChange = (event: CustomEvent<InputEvent>) => {
    const target = event.target as HTMLInputElement;
    setSearchValue(target.value || "");
  };

  const tabs = [{ label: "Active" }, { label: "Drafts" }];

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
        <ModusButton
          icon="sort"
          iconPosition="only"
          variant="borderless"
          size="md"
          ariaLabel="Sort"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4 max-h-[calc(100vh-310px)]">
        {filteredExpenses.map((expense, index) => (
          <ExpenseCard
            key={`expense-${expense.name}-${index}`}
            expense={expense}
          />
        ))}
        {filteredExpenses.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-foreground-60">
            <i className="modus-icons text-4xl mb-3">search</i>
            <div className="text-lg">No expenses found</div>
          </div>
        )}
      </div>
    </div>,
    <EmptyTabContent key="drafts" label="draft" />,
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col px-6 pt-6 overflow-hidden max-w-6xl mx-auto w-full">
        <div className="text-2xl text-foreground mb-4">Expense Hub</div>

        <div className="flex-1 min-h-0">
          <div className="w-full">
            <ModusTabs
              tabs={tabs}
              panels={panels}
              activeTabIndex={activeTab}
              onTabChange={({ newTab }) => setActiveTab(newTab)}
              ariaLabel="Expense status tabs"
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
          Add Expense
        </ModusButton>
      </div>
    </div>
  );
}
