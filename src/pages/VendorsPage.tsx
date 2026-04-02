import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import ModusTabs from "../components/ModusTabs";
import ModusTextInput from "../components/ModusTextInput";
import ModusButton from "../components/ModusButton";

interface Vendor {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  activeInvoices: number;
  openBalance: string;
  openBalanceValue: number;
}

const ACTIVE_VENDORS: Vendor[] = [
  {
    name: "ABC Electric",
    contactName: "Patricia Moore",
    email: "patricia.m@abcelectric.com",
    phone: "(503) 184-5678",
    activeInvoices: 3,
    openBalance: "$61,679.37",
    openBalanceValue: 61679.37,
  },
  {
    name: "Pacific Supply Co",
    contactName: "James Whitfield",
    email: "j.whitfield@pacificsupply.com",
    phone: "(206) 555-0142",
    activeInvoices: 1,
    openBalance: "$12,450.00",
    openBalanceValue: 12450,
  },
  {
    name: "Redwood Materials",
    contactName: "Sarah Chen",
    email: "schen@redwoodmaterials.com",
    phone: "(415) 332-8900",
    activeInvoices: 5,
    openBalance: "$89,210.50",
    openBalanceValue: 89210.5,
  },
  {
    name: "Summit Plumbing",
    contactName: "David Torres",
    email: "dtorres@summitplumbing.com",
    phone: "(503) 221-7744",
    activeInvoices: 0,
    openBalance: "$0.00",
    openBalanceValue: 0,
  },
  {
    name: "Northgate Concrete",
    contactName: "Maria Jensen",
    email: "mjensen@northgateconcrete.com",
    phone: "(360) 449-3321",
    activeInvoices: 2,
    openBalance: "$24,800.00",
    openBalanceValue: 24800,
  },
  {
    name: "Cascade HVAC Systems",
    contactName: "Robert Nakamura",
    email: "r.nakamura@cascadehvac.com",
    phone: "(425) 778-6600",
    activeInvoices: 1,
    openBalance: "$7,350.00",
    openBalanceValue: 7350,
  },
  {
    name: "Ironworks Fabrication",
    contactName: "Linda Park",
    email: "lpark@ironworksfab.com",
    phone: "(971) 302-1155",
    activeInvoices: 4,
    openBalance: "$43,920.00",
    openBalanceValue: 43920,
  },
  {
    name: "Valley Glass & Mirror",
    contactName: "Thomas Brennan",
    email: "tbrennan@valleyglass.com",
    phone: "(509) 555-2280",
    activeInvoices: 0,
    openBalance: "$0.00",
    openBalanceValue: 0,
  },
  {
    name: "EverGreen Landscaping",
    contactName: "Angela Ruiz",
    email: "aruiz@evergreenlandscape.com",
    phone: "(253) 867-5309",
    activeInvoices: 2,
    openBalance: "$15,600.00",
    openBalanceValue: 15600,
  },
  {
    name: "BlueLine Roofing",
    contactName: "Kevin O'Brien",
    email: "kobrien@bluelineroof.com",
    phone: "(541) 683-4400",
    activeInvoices: 1,
    openBalance: "$31,250.00",
    openBalanceValue: 31250,
  },
];

function VendorCard({ vendor }: { vendor: Vendor }) {
  const hasActiveInvoices = vendor.activeInvoices > 0;
  const hasBalance = vendor.openBalanceValue > 0;

  return (
    <div className="bg-background border-default rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-base font-bold text-foreground pr-4">
          {vendor.name}
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
        <i className="modus-icons text-sm text-foreground-60">person</i>
        <div>{vendor.contactName}</div>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-1">
        <i className="modus-icons text-sm text-foreground-60">email</i>
        <div>{vendor.email}</div>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-4">
        <i className="modus-icons text-sm text-foreground-60">phone</i>
        <div>{vendor.phone}</div>
      </div>

      <div className="border-bottom-default mb-3" />

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-foreground-60">Active Invoices</div>
          <div
            className={`text-sm font-bold ${hasActiveInvoices ? "text-success" : "text-foreground"}`}
          >
            {vendor.activeInvoices}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-foreground-60">Open Balance</div>
          <div
            className={`text-sm font-bold ${hasBalance ? "text-success" : "text-foreground"}`}
          >
            {vendor.openBalance}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyTabContent({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-foreground-60">
      <i className="modus-icons text-4xl mb-3">factory</i>
      <div className="text-lg">No {label} vendors</div>
    </div>
  );
}

export default function VendorsPage() {
  usePageTitle("Vendors");
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const filteredVendors = useMemo(() => {
    if (!searchValue.trim()) return ACTIVE_VENDORS;
    const query = searchValue.toLowerCase();
    return ACTIVE_VENDORS.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.contactName.toLowerCase().includes(query) ||
        v.email.toLowerCase().includes(query),
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
        {filteredVendors.map((vendor, index) => (
          <VendorCard
            key={`vendor-${vendor.name}-${index}`}
            vendor={vendor}
          />
        ))}
        {filteredVendors.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-foreground-60">
            <i className="modus-icons text-4xl mb-3">search</i>
            <div className="text-lg">No vendors found</div>
          </div>
        )}
      </div>
    </div>,
    <EmptyTabContent key="drafts" label="draft" />,
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col px-6 pt-6 overflow-hidden max-w-6xl mx-auto w-full">
        <div className="text-2xl text-foreground mb-4">Vendors Hub</div>

        <div className="flex-1 min-h-0">
          <div className="w-full">
            <ModusTabs
              tabs={tabs}
              panels={panels}
              activeTabIndex={activeTab}
              onTabChange={({ newTab }) => setActiveTab(newTab)}
              ariaLabel="Vendor status tabs"
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
          Add Vendor
        </ModusButton>
      </div>
    </div>
  );
}
