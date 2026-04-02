import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import ModusTabs from "../components/ModusTabs";
import ModusTextInput from "../components/ModusTextInput";
import ModusButton from "../components/ModusButton";
import ModusProgress from "../components/ModusProgress";

interface Job {
  name: string;
  location: string;
  dateRange: string;
  progress: number;
  contractValue: string;
  revenue: string;
  profit: string;
  margin: string;
  customer: string;
}

const ACTIVE_JOBS: Job[] = [
  {
    name: "MARCO HOME REMOCEL 0224",
    location: "123rd Avenue. Anderson Island, WA",
    dateRange: "February 17, 2026 - February 24, 2026",
    progress: 30,
    contractValue: "$12,000.00",
    revenue: "--",
    profit: "--",
    margin: "--",
    customer: "marco0224 - MArco",
  },
  {
    name: "MARCO REMODEL 2 0223",
    location: "E4144 Road. Rochester, WA",
    dateRange: "February 23, 2026 - March 9, 2026",
    progress: 0,
    contractValue: "$18,000.00",
    revenue: "--",
    profit: "--",
    margin: "--",
    customer: "MARCO0223 - MAR CO",
  },
  {
    name: "MARCO REMODEL 0223",
    location: "East 4565 South. Salt Lake City, UT",
    dateRange: "February 23, 2026 - March 2, 2026",
    progress: 35,
    contractValue: "$1,800.00",
    revenue: "--",
    profit: "--",
    margin: "--",
    customer: "MARCO0223 - MARCO REMODEL",
  },
  {
    name: "Chair Repair",
    location: "429 128th Street Southwest. Everett, WA",
    dateRange: "February 26, 2026 - February 27, 2026",
    progress: 0,
    contractValue: "$2,300.00",
    revenue: "--",
    profit: "--",
    margin: "--",
    customer: "CHAIR-001 - Chair Co",
  },
  {
    name: "RICARDO SINAI PROJECT",
    location: "Calle Rio Tijuana. Valle de los Angeles, BJ",
    dateRange: "December 11, 2025 - January 1, 2026",
    progress: 55,
    contractValue: "$62,700.00",
    revenue: "--",
    profit: "--",
    margin: "--",
    customer: "RICARDO SINAI MIRANDA P1 - OPERADORA MERB...",
  },
  {
    name: "ANGA PROJECT",
    location: "123 Heffernan Avenue. Calexico, CA",
    dateRange: "February 18, 2026 - February 1, 2026",
    progress: 0,
    contractValue: "$1,200.00",
    revenue: "--",
    profit: "--",
    margin: "--",
    customer: "ANGA - ALAN CO",
  },
  {
    name: "test string input proposal name",
    location: "123rd Avenue. Anderson Island, WA",
    dateRange: "February 2, 2026 - February 16, 2026",
    progress: 30,
    contractValue: "$2,200.00",
    revenue: "--",
    profit: "--",
    margin: "--",
    customer: "test string input nickname - test string input com...",
  },
  {
    name: "Nick's Test Job",
    location: "Pennsyl Point. Milford, PA",
    dateRange: "February 19, 2026 - February 27, 2026",
    progress: 50,
    contractValue: "$22,344.30",
    revenue: "--",
    profit: "--",
    margin: "--",
    customer: "2ff2gda",
  },
  {
    name: "Anderson Island Remodel",
    location: "456 Main Street. Anderson Island, WA",
    dateRange: "February 10, 2026 - March 5, 2026",
    progress: 20,
    contractValue: "$8,500.00",
    revenue: "--",
    profit: "--",
    margin: "--",
    customer: "ANDERSON-001 - Anderson LLC",
  },
  {
    name: "Everett Office Build",
    location: "789 Commerce Ave. Everett, WA",
    dateRange: "January 15, 2026 - March 15, 2026",
    progress: 40,
    contractValue: "$45,000.00",
    revenue: "--",
    profit: "--",
    margin: "--",
    customer: "EVERETT-002 - Everett Corp",
  },
];

function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-background border-default rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-base font-bold text-foreground pr-4">
          {job.name}
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
        <div>{job.location}</div>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground-60 mb-4">
        <i className="modus-icons text-sm text-foreground-60">calendar</i>
        <div>{job.dateRange}</div>
      </div>

      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-foreground-60">Progress</div>
        <div className="text-sm text-foreground-60">--</div>
      </div>
      <div className="mb-4">
        <ModusProgress value={job.progress} max={100} ariaLabel="Job progress" />
      </div>

      <div className="border-bottom-default mb-3" />

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-foreground-60">Contract Value</div>
        <div className="text-base font-bold text-foreground">
          {job.contractValue}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <div className="text-sm text-foreground-60">Revenue</div>
          <div className="text-sm font-semibold text-foreground">
            {job.revenue}
          </div>
        </div>
        <div>
          <div className="text-sm text-foreground-60">Profit</div>
          <div className="text-sm font-semibold text-foreground">
            {job.profit}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-foreground-60">Margin</div>
          <div className="text-sm font-semibold text-foreground">
            {job.margin}
          </div>
        </div>
      </div>

      <div className="border-bottom-default mb-3" />

      <div>
        <div className="text-sm text-foreground-60">Customer</div>
        <div className="text-sm font-bold text-foreground truncate">
          {job.customer}
        </div>
      </div>
    </div>
  );
}

function EmptyTabContent({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-foreground-60">
      <i className="modus-icons text-4xl mb-3">briefcase</i>
      <div className="text-lg">No {label} jobs</div>
    </div>
  );
}

export default function JobsPage() {
  usePageTitle("Jobs");
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const filteredJobs = useMemo(() => {
    if (!searchValue.trim()) return ACTIVE_JOBS;
    const query = searchValue.toLowerCase();
    return ACTIVE_JOBS.filter(
      (job) =>
        job.name.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.customer.toLowerCase().includes(query),
    );
  }, [searchValue]);

  const handleSearchChange = (event: CustomEvent<InputEvent>) => {
    const target = event.target as HTMLInputElement;
    setSearchValue(target.value || "");
  };

  const tabs = [
    { label: "Active" },
    { label: "Proposals" },
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
        <ModusButton
          icon="sort"
          iconPosition="only"
          variant="borderless"
          size="md"
          ariaLabel="Sort"
        />
        <ModusButton
          icon="filter"
          iconPosition="only"
          variant="borderless"
          size="md"
          ariaLabel="Filter"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4 max-h-[calc(100vh-310px)]">
        {filteredJobs.map((job, index) => (
          <JobCard key={`job-${job.name}-${index}`} job={job} />
        ))}
        {filteredJobs.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-foreground-60">
            <i className="modus-icons text-4xl mb-3">search</i>
            <div className="text-lg">No jobs found</div>
          </div>
        )}
      </div>
    </div>,
    <EmptyTabContent key="proposals" label="proposal" />,
    <EmptyTabContent key="drafts" label="draft" />,
    <EmptyTabContent key="archived" label="archived" />,
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col px-6 pt-6 overflow-hidden max-w-6xl mx-auto w-full">
        <div className="text-2xl text-foreground mb-4">Job Hub</div>

        <div className="flex-1 min-h-0">
          <div className="w-full">
            <ModusTabs
              tabs={tabs}
              panels={panels}
              activeTabIndex={activeTab}
              onTabChange={({ newTab }) => setActiveTab(newTab)}
              ariaLabel="Job status tabs"
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
          Add Job
        </ModusButton>
      </div>
    </div>
  );
}
