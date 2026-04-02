import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import ModusTabs from "../components/ModusTabs";
import ModusTextInput from "../components/ModusTextInput";
import ModusButton from "../components/ModusButton";

interface Customer {
  name: string;
  location: string;
  email: string;
  phone: string;
  activeJobs: number;
  openBalance: string;
  openBalanceValue: number;
}

const ACTIVE_CUSTOMERS: Customer[] = [
  {
    name: "Charly Harrison Group",
    location: "123 East 1st Street. Calexico, CA",
    email: "charly@harrison.com",
    phone: "+1 (760) 357-2355",
    activeJobs: 0,
    openBalance: "$0.00",
    openBalanceValue: 0,
  },
  {
    name: "New Customer",
    location: "Canada Way. Vancouver, BC",
    email: "newcustomer@example.com",
    phone: "+52 686 111 1111",
    activeJobs: 0,
    openBalance: "$0.00",
    openBalanceValue: 0,
  },
  {
    name: "Gigid",
    location: "1234th Street. River Falls, WI",
    email: "gigid@trimble.com",
    phone: "+1 (612) 316-5498",
    activeJobs: 0,
    openBalance: "$0.00",
    openBalanceValue: 0,
  },
  {
    name: "marco0224",
    location: "123rd Avenue. Anderson Island, WA",
    email: "marco0224@trimble.com",
    phone: "--",
    activeJobs: 1,
    openBalance: "$7,000.00",
    openBalanceValue: 7000,
  },
  {
    name: "MARCO0223",
    location: "123rd Avenue. Anderson Island, WA",
    email: "marco0223@trimble.com",
    phone: "+1 (760) 357-2355",
    activeJobs: 0,
    openBalance: "$0.00",
    openBalanceValue: 0,
  },
  {
    name: "P-Hut",
    location: "7100 Corporate Drive. Plano, TX",
    email: "thehut@pizza.com",
    phone: "--",
    activeJobs: 1,
    openBalance: "$2,300.00",
    openBalanceValue: 2300,
  },
  {
    name: "2ff2gda",
    location: "1200 Camino del Rio. Calexico, CA",
    email: "asdf@asdf.com",
    phone: "--",
    activeJobs: 0,
    openBalance: "$0.00",
    openBalanceValue: 0,
  },
  {
    name: "Rubber",
    location: "4821 E Industrial Pkwy. Phoenix, As",
    email: "--",
    phone: "+1 619204856",
    activeJobs: 0,
    openBalance: "$0.00",
    openBalanceValue: 0,
  },
  {
    name: "MartinezManuel",
    location: "Calexico Drive. Redding, CA",
    email: "manuel@example.com",
    phone: "--",
    activeJobs: 1,
    openBalance: "$800.00",
    openBalanceValue: 800,
  },
  {
    name: "Jocabrera",
    location: "Avenida De Las Gentianas. Justo Sierra, BJ",
    email: "jorge@test.com",
    phone: "+52 686 134 9754",
    activeJobs: 0,
    openBalance: "$70.00",
    openBalanceValue: 70,
  },
  {
    name: "Anderssen Builders",
    location: "429 128th Street Southwest. Everett, WA",
    email: "info@anderssen.com",
    phone: "+1 (425) 555-0198",
    activeJobs: 0,
    openBalance: "$0.00",
    openBalanceValue: 0,
  },
  {
    name: "ANGA",
    location: "777 S Street. Baja California, BJ",
    email: "contact@anga.com",
    phone: "--",
    activeJobs: 1,
    openBalance: "$1,200.00",
    openBalanceValue: 1200,
  },
];

function CustomerCard({ customer }: { customer: Customer }) {
  const hasActiveJobs = customer.activeJobs > 0;
  const hasBalance = customer.openBalanceValue > 0;

  return (
    <div className="bg-background border-default rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-base font-bold text-foreground pr-4">
          {customer.name}
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
        <i className="modus-icons text-sm text-primary">location_point</i>
        <div>{customer.location}</div>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-1">
        <i className="modus-icons text-sm text-foreground-60">email</i>
        <div>{customer.email}</div>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-4">
        <i className="modus-icons text-sm text-foreground-60">phone</i>
        <div>{customer.phone}</div>
      </div>

      <div className="border-bottom-default mb-3" />

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-foreground-60">Active Jobs</div>
          <div
            className={`text-sm font-bold ${hasActiveJobs ? "text-success" : "text-foreground"}`}
          >
            {customer.activeJobs}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-foreground-60">Open Balance</div>
          <div
            className={`text-sm font-bold ${hasBalance ? "text-success" : "text-foreground"}`}
          >
            {customer.openBalance}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyTabContent({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-foreground-60">
      <i className="modus-icons text-4xl mb-3">person</i>
      <div className="text-lg">No {label} customers</div>
    </div>
  );
}

export default function CustomersPage() {
  usePageTitle("Customers");
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const filteredCustomers = useMemo(() => {
    if (!searchValue.trim()) return ACTIVE_CUSTOMERS;
    const query = searchValue.toLowerCase();
    return ACTIVE_CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query),
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
        {filteredCustomers.map((customer, index) => (
          <CustomerCard
            key={`customer-${customer.name}-${index}`}
            customer={customer}
          />
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-foreground-60">
            <i className="modus-icons text-4xl mb-3">search</i>
            <div className="text-lg">No customers found</div>
          </div>
        )}
      </div>
    </div>,
    <EmptyTabContent key="drafts" label="draft" />,
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col px-6 pt-6 overflow-hidden max-w-6xl mx-auto w-full">
        <div className="text-2xl text-foreground mb-4">Customer Hub</div>

        <div className="flex-1 min-h-0">
          <div className="w-full">
            <ModusTabs
              tabs={tabs}
              panels={panels}
              activeTabIndex={activeTab}
              onTabChange={({ newTab }) => setActiveTab(newTab)}
              ariaLabel="Customer status tabs"
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
          Add Customer
        </ModusButton>
      </div>
    </div>
  );
}
