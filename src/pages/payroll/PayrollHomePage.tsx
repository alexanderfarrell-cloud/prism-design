import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import ModusButton from "../../components/ModusButton";
import ModusBadge from "../../components/ModusBadge";
import type { ModusBadgeColor } from "../../components/ModusBadge";
import ModusDropdownMenu from "../../components/ModusDropdownMenu";

interface SetupTask {
  icon: string;
  title: string;
  description: string;
  done?: boolean;
  badge: string;
  badgeColor: ModusBadgeColor;
}

const SETUP_TASKS: SetupTask[] = [
  {
    icon: "building_corporate",
    title: "Review your business details",
    description:
      "Review your company name, address, and tax identification details.",
    done: true,
    badge: "Done",
    badgeColor: "success",
  },
  {
    icon: "document",
    title: "Review your tax info",
    description:
      "Review federal and state tax information for payroll processing.",
    done: true,
    badge: "Done",
    badgeColor: "success",
  },
  {
    icon: "credit_card",
    title: "Connect your bank",
    description:
      "Enter your business bank account for direct deposit and payroll transactions.",
    badge: "Pending",
    badgeColor: "warning",
  },
  {
    icon: "people_group",
    title: "Add employees",
    description:
      "Create employee profiles with personal and payment information.",
    badge: "Pending",
    badgeColor: "warning",
  },
  {
    icon: "calendar",
    title: "Set your pay schedule",
    description:
      "Enter when and how often you'll run payroll for your team.",
    badge: "Pending",
    badgeColor: "warning",
  },
  {
    icon: "shield",
    title: "Workers' compensation",
    description:
      "Enter workers' comp policy details and class codes for coverage.",
    badge: "Optional",
    badgeColor: "secondary",
  },
  {
    icon: "gears",
    title: "Create wages",
    description:
      "Create labor types to assign wages for your team.",
    badge: "Pending",
    badgeColor: "warning",
  },
];

const TODO_TASKS: SetupTask[] = [
  {
    icon: "alert",
    title: "Local Tax Alert",
    description:
      "A new job was added and we detected local tax requirements. Please confirm.",
    badge: "Pending",
    badgeColor: "warning",
  },
  {
    icon: "timesheet_approve",
    title: "Approve pending timesheets",
    description:
      "Review and approve submitted timesheets before the next pay run.",
    badge: "Pending",
    badgeColor: "warning",
  },
  {
    icon: "warning",
    title: "Tax Reciprocity Alert",
    description:
      "A non-residency form is required for [Employee Name] in [State] to ensure correct withholding and prevent double taxation.",
    badge: "Pending",
    badgeColor: "warning",
  },
];

interface QuickAction {
  icon: string;
  label: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: "earnings_statement", label: "Run Payroll" },
  { icon: "history", label: "View PayRun History" },
  { icon: "payment_instant", label: "Quick Pay" },
  { icon: "person_add", label: "Add Employee" },
  { icon: "file_bar_graph", label: "View Reports" },
];

interface Resource {
  icon: string;
  label: string;
}

const RESOURCES: Resource[] = [
  { icon: "user_guide", label: "Setup Guide" },
  { icon: "help", label: "FAQs" },
  { icon: "certificate", label: "Compliance Info" },
];

function SectionHeader({
  title,
  icon,
  actionLabel = "View All",
  onAction,
}: {
  title: string;
  icon: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="text-lg font-bold text-foreground">{title}</div>
        <i className="modus-icons text-2xl text-muted-foreground">{icon}</i>
      </div>
      <ModusButton variant="borderless" color="primary" size="sm" onButtonClick={onAction}>
        {actionLabel}
      </ModusButton>
    </div>
  );
}

function TaskRow({ task }: { task: SetupTask }) {
  return (
    <div className={`flex flex-col gap-2 p-4 cursor-pointer hover:bg-muted transition-colors rounded ${task.done ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${task.done ? "bg-success" : "bg-primary"}`}>
          <i className="modus-icons text-xs text-primary-foreground">
            {task.done ? "check" : task.icon}
          </i>
        </div>
        <div className={`flex-1 text-sm font-bold ${task.done ? "line-through text-foreground-60" : "text-foreground"}`}>
          {task.title}
        </div>
        <ModusBadge color={task.badgeColor} variant={task.done ? "filled" : "outlined"} size="sm">
          {task.badge}
        </ModusBadge>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 text-sm text-foreground-60">
          {task.description}
        </div>
        {!task.done && (
          <i className="modus-icons text-foreground-40 flex-shrink-0">
            chevron_right
          </i>
        )}
      </div>
    </div>
  );
}

function ActivityCard() {
  return (
    <div className="bg-background border-default rounded-lg p-6">
      <SectionHeader title="Activity" icon="pulse" />
      <div className="flex flex-col gap-3">
        <div className="border-default rounded-lg p-4">
          <div className="text-sm font-bold text-foreground mb-2">
            Upcoming Payroll
          </div>
          <div className="flex flex-col gap-1 text-xs text-foreground-60 mb-3">
            <div>Next pay date: Mar 15, 2026</div>
            <div>Pay period: Mar 1 - Mar 15</div>
            <div>Employees: 12</div>
            <div>Total: $47,250.00</div>
          </div>
          <ModusButton variant="outlined" color="primary" size="sm">
            View Details
          </ModusButton>
        </div>
        <div className="border-default rounded-lg p-4">
          <div className="text-sm font-bold text-foreground mb-2">
            Payments in process
          </div>
          <div className="flex flex-col gap-1 text-xs text-foreground-60">
            <div>Submitted: Mar 4, 2026</div>
            <div>Pay date: Mar 8, 2026</div>
            <div>Direct deposits: 12</div>
            <div>Amount: $47,250.00</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Deadline {
  date: string;
  label: string;
  category: "pay-date" | "tax-deposit" | "state-filing" | "compliance";
  urgency: "overdue" | "urgent" | "upcoming" | "normal";
}

const DEADLINES: Deadline[] = [
  { date: "Mar 25", label: "Federal 941 deposit due", category: "tax-deposit", urgency: "overdue" },
  { date: "Mar 28", label: "CO withholding deposit due", category: "tax-deposit", urgency: "urgent" },
  { date: "Mar 31", label: "Q1 state unemployment filing - CO", category: "state-filing", urgency: "urgent" },
  { date: "Apr 1", label: "Bi-weekly pay date", category: "pay-date", urgency: "upcoming" },
  { date: "Apr 10", label: "Workers' comp audit response due", category: "compliance", urgency: "upcoming" },
  { date: "Apr 15", label: "Bi-weekly pay date", category: "pay-date", urgency: "normal" },
  { date: "Apr 15", label: "Federal 941 deposit due", category: "tax-deposit", urgency: "normal" },
  { date: "Apr 30", label: "Q1 Form 941 filing deadline", category: "state-filing", urgency: "normal" },
  { date: "May 1", label: "Bi-weekly pay date", category: "pay-date", urgency: "normal" },
  { date: "May 15", label: "General liability renewal", category: "compliance", urgency: "normal" },
];

const URGENCY_CONFIG: Record<Deadline["urgency"], { badgeColor: ModusBadgeColor; icon: string }> = {
  overdue: { badgeColor: "danger", icon: "alert" },
  urgent: { badgeColor: "warning", icon: "warning" },
  upcoming: { badgeColor: "primary", icon: "calendar" },
  normal: { badgeColor: "secondary", icon: "calendar" },
};

const CATEGORY_LABELS: Record<Deadline["category"], string> = {
  "pay-date": "Pay Date",
  "tax-deposit": "Tax Deposit",
  "state-filing": "State Filing",
  "compliance": "Compliance",
};

const DEADLINES_COLLAPSED_COUNT = 5;

function DeadlineTrackerCard() {
  const [expanded, setExpanded] = useState(false);
  const visibleDeadlines = expanded ? DEADLINES : DEADLINES.slice(0, DEADLINES_COLLAPSED_COUNT);

  return (
    <div className="bg-background border-default rounded-lg p-6">
      <SectionHeader
        title="Upcoming Dates"
        icon="calendar"
        actionLabel={expanded ? "Show Less" : "View All"}
        onAction={() => setExpanded((prev) => !prev)}
      />
      <div className="text-xs text-foreground-60 mb-3">
        60-day rolling view -- urgency-ranked
      </div>
      <div className="flex flex-col gap-2">
        {visibleDeadlines.map((d, idx) => {
          const config = URGENCY_CONFIG[d.urgency];
          return (
            <div
              key={`deadline-${d.label}-${idx}`}
              className={`flex items-start gap-3 p-3 rounded-lg border-default cursor-pointer hover:bg-muted transition-colors ${d.urgency === "overdue" ? "bg-destructive-5" : ""}`}
            >
              <div className={`flex-shrink-0 mt-0.5 ${d.urgency === "overdue" ? "text-destructive" : d.urgency === "urgent" ? "text-warning" : "text-foreground-40"}`}>
                <i className="modus-icons text-base">{config.icon}</i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="text-sm font-bold text-foreground">{d.date}</div>
                  <ModusBadge color={config.badgeColor} variant="outlined" size="sm">
                    {CATEGORY_LABELS[d.category]}
                  </ModusBadge>
                </div>
                <div className="text-xs text-foreground-60 truncate">{d.label}</div>
              </div>
              {(d.urgency === "overdue" || d.urgency === "urgent") && (
                <div className={`flex-shrink-0 text-xs font-bold ${d.urgency === "overdue" ? "text-destructive" : "text-warning"}`}>
                  {d.urgency === "overdue" ? "Overdue" : "Due Soon"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickActionsCard() {
  return (
    <div className="bg-background border-default rounded-lg p-6">
      <SectionHeader title="Quick Actions" icon="bolt" />
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <div
            key={`action-${action.label}`}
            className="border-default rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-colors"
          >
            <i className="modus-icons text-2xl text-primary">{action.icon}</i>
            <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
              {action.label}
              <i className="modus-icons text-sm text-foreground-40">
                chevron_right
              </i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourcesCard() {
  return (
    <div className="bg-background border-default rounded-lg p-6">
      <SectionHeader title="Resources" icon="learn" />
      <div className="grid grid-cols-2 gap-3">
        {RESOURCES.map((resource) => (
          <div
            key={`resource-${resource.label}`}
            className="border-default rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-colors"
          >
            <i className="modus-icons text-2xl text-primary">
              {resource.icon}
            </i>
            <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
              {resource.label}
              <i className="modus-icons text-sm text-foreground-40">
                chevron_right
              </i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MetricCard {
  label: string;
  value: string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
}

interface WeeklyData {
  week: string;
  amount: number;
  overtimeHrs: number;
}

interface JobMetrics {
  metrics: MetricCard[];
  weeklyNetPay: WeeklyData[];
  avgWeekly: string;
}

const JOB_OPTIONS = [
  { label: "All Jobs", value: "all" },
  { label: "Active Jobs", value: "active-jobs" },
  { label: "New Home - Glenwood Springs", value: "new-home" },
  { label: "New Building - Mineral Point", value: "new-building" },
  { label: "Office Remodel - Denver", value: "office-remodel" },
];

const LABOR_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Carpenters", value: "carpenters" },
  { label: "Plumbers", value: "plumbers" },
  { label: "Electricians", value: "electricians" },
  { label: "Laborers", value: "laborers" },
  { label: "Heavy Equipment Operators", value: "operators" },
  { label: "Ironworkers", value: "ironworkers" },
  { label: "Masons", value: "masons" },
  { label: "Painters", value: "painters" },
  { label: "Foremen", value: "foremen" },
  { label: "Superintendents", value: "superintendents" },
];

const METRICS_BY_JOB: Record<string, JobMetrics> = {
  all: {
    metrics: [
      { label: "YTD Gross Pay", value: "$1,847,200", icon: "monetarization", trend: "+12.4%", trendUp: true },
      { label: "YTD Employer Tax", value: "$141,310", icon: "invoice", trend: "+8.1%", trendUp: true },
      { label: "Active Headcount", value: "47", icon: "people_group", trend: "+5", trendUp: true },
      { label: "Avg Weekly Net Pay", value: "$28,640", icon: "bar_graph_line", trend: "-1.2%", trendUp: false },
    ],
    weeklyNetPay: [
      { week: "Jan 27", amount: 27400, overtimeHrs: 12 },
      { week: "Feb 3", amount: 29800, overtimeHrs: 18 },
      { week: "Feb 10", amount: 28100, overtimeHrs: 8 },
      { week: "Feb 17", amount: 30500, overtimeHrs: 22 },
      { week: "Feb 24", amount: 27900, overtimeHrs: 6 },
      { week: "Mar 3", amount: 29200, overtimeHrs: 14 },
      { week: "Mar 10", amount: 30100, overtimeHrs: 20 },
      { week: "Mar 17", amount: 28640, overtimeHrs: 16 },
    ],
    avgWeekly: "$28,640",
  },
  "active-jobs": {
    metrics: [
      { label: "YTD Gross Pay", value: "$1,452,000", icon: "monetarization", trend: "+14.8%", trendUp: true },
      { label: "YTD Employer Tax", value: "$111,078", icon: "invoice", trend: "+9.5%", trendUp: true },
      { label: "Active Headcount", value: "38", icon: "people_group", trend: "+4", trendUp: true },
      { label: "Avg Weekly Net Pay", value: "$22,480", icon: "bar_graph_line", trend: "+1.6%", trendUp: true },
    ],
    weeklyNetPay: [
      { week: "Jan 27", amount: 21500, overtimeHrs: 10 },
      { week: "Feb 3", amount: 23400, overtimeHrs: 15 },
      { week: "Feb 10", amount: 22100, overtimeHrs: 6 },
      { week: "Feb 17", amount: 24200, overtimeHrs: 19 },
      { week: "Feb 24", amount: 21900, overtimeHrs: 4 },
      { week: "Mar 3", amount: 22800, overtimeHrs: 11 },
      { week: "Mar 10", amount: 23600, overtimeHrs: 17 },
      { week: "Mar 17", amount: 22480, overtimeHrs: 12 },
    ],
    avgWeekly: "$22,480",
  },
  "new-home": {
    metrics: [
      { label: "YTD Gross Pay", value: "$624,000", icon: "monetarization", trend: "+15.2%", trendUp: true },
      { label: "YTD Employer Tax", value: "$47,736", icon: "invoice", trend: "+10.3%", trendUp: true },
      { label: "Active Headcount", value: "18", icon: "people_group", trend: "+2", trendUp: true },
      { label: "Avg Weekly Net Pay", value: "$11,520", icon: "bar_graph_line", trend: "+3.1%", trendUp: true },
    ],
    weeklyNetPay: [
      { week: "Jan 27", amount: 10560, overtimeHrs: 5 },
      { week: "Feb 3", amount: 11840, overtimeHrs: 9 },
      { week: "Feb 10", amount: 11120, overtimeHrs: 3 },
      { week: "Feb 17", amount: 12480, overtimeHrs: 12 },
      { week: "Feb 24", amount: 11280, overtimeHrs: 4 },
      { week: "Mar 3", amount: 12000, overtimeHrs: 7 },
      { week: "Mar 10", amount: 12160, overtimeHrs: 8 },
      { week: "Mar 17", amount: 11520, overtimeHrs: 6 },
    ],
    avgWeekly: "$11,520",
  },
  "new-building": {
    metrics: [
      { label: "YTD Gross Pay", value: "$491,000", icon: "monetarization", trend: "+8.7%", trendUp: true },
      { label: "YTD Employer Tax", value: "$37,562", icon: "invoice", trend: "+5.9%", trendUp: true },
      { label: "Active Headcount", value: "14", icon: "people_group", trend: "+1", trendUp: true },
      { label: "Avg Weekly Net Pay", value: "$7,920", icon: "bar_graph_line", trend: "-2.4%", trendUp: false },
    ],
    weeklyNetPay: [
      { week: "Jan 27", amount: 8260, overtimeHrs: 4 },
      { week: "Feb 3", amount: 8470, overtimeHrs: 7 },
      { week: "Feb 10", amount: 8050, overtimeHrs: 2 },
      { week: "Feb 17", amount: 7630, overtimeHrs: 1 },
      { week: "Feb 24", amount: 7420, overtimeHrs: 0 },
      { week: "Mar 3", amount: 7700, overtimeHrs: 3 },
      { week: "Mar 10", amount: 7980, overtimeHrs: 5 },
      { week: "Mar 17", amount: 7920, overtimeHrs: 2 },
    ],
    avgWeekly: "$7,920",
  },
  "office-remodel": {
    metrics: [
      { label: "YTD Gross Pay", value: "$337,200", icon: "monetarization", trend: "+18.6%", trendUp: true },
      { label: "YTD Employer Tax", value: "$25,800", icon: "invoice", trend: "+12.1%", trendUp: true },
      { label: "Active Headcount", value: "6", icon: "people_group", trend: "+1", trendUp: true },
      { label: "Avg Weekly Net Pay", value: "$5,280", icon: "bar_graph_line", trend: "+5.8%", trendUp: true },
    ],
    weeklyNetPay: [
      { week: "Jan 27", amount: 4820, overtimeHrs: 2 },
      { week: "Feb 3", amount: 5410, overtimeHrs: 5 },
      { week: "Feb 10", amount: 5490, overtimeHrs: 3 },
      { week: "Feb 17", amount: 6380, overtimeHrs: 8 },
      { week: "Feb 24", amount: 5340, overtimeHrs: 1 },
      { week: "Mar 3", amount: 5040, overtimeHrs: 0 },
      { week: "Mar 10", amount: 5860, overtimeHrs: 6 },
      { week: "Mar 17", amount: 5280, overtimeHrs: 3 },
    ],
    avgWeekly: "$5,280",
  },
};

const LABOR_MODIFIERS: Record<string, { payScale: number; headcount: number; otScale: number }> = {
  all: { payScale: 1.0, headcount: 1.0, otScale: 1.0 },
  carpenters: { payScale: 0.26, headcount: 0.23, otScale: 1.6 },
  plumbers: { payScale: 0.14, headcount: 0.13, otScale: 0.9 },
  electricians: { payScale: 0.13, headcount: 0.11, otScale: 0.7 },
  laborers: { payScale: 0.15, headcount: 0.21, otScale: 2.0 },
  operators: { payScale: 0.11, headcount: 0.06, otScale: 1.3 },
  ironworkers: { payScale: 0.08, headcount: 0.06, otScale: 1.8 },
  masons: { payScale: 0.05, headcount: 0.06, otScale: 0.6 },
  painters: { payScale: 0.04, headcount: 0.06, otScale: 0.3 },
  foremen: { payScale: 0.07, headcount: 0.04, otScale: 0.4 },
  superintendents: { payScale: 0.06, headcount: 0.02, otScale: 0.1 },
};

const OT_THRESHOLD_OPTIONS = [
  { label: "> 4 hours", value: "4" },
  { label: "> 6 hours", value: "6" },
  { label: "> 8 hours", value: "8" },
  { label: "> 10 hours", value: "10" },
  { label: "> 15 hours", value: "15" },
  { label: "> 20 hours", value: "20" },
];

function applyLaborFilter(base: JobMetrics, laborKey: string): JobMetrics {
  const mod = LABOR_MODIFIERS[laborKey] ?? LABOR_MODIFIERS.all;
  if (laborKey === "all") return base;

  const scaleDollar = (val: string) => {
    const num = parseFloat(val.replace(/[$,]/g, ""));
    const scaled = Math.round(num * mod.payScale);
    return `$${scaled.toLocaleString()}`;
  };

  return {
    metrics: base.metrics.map((m) => {
      if (m.label === "Active Headcount") {
        const num = parseInt(m.value.replace(/,/g, ""), 10);
        return { ...m, value: String(Math.max(1, Math.round(num * mod.headcount))) };
      }
      return { ...m, value: scaleDollar(m.value) };
    }),
    weeklyNetPay: base.weeklyNetPay.map((w) => ({
      ...w,
      amount: Math.max(100, Math.round(w.amount * mod.payScale)),
      overtimeHrs: Math.max(0, Math.round(w.overtimeHrs * mod.otScale)),
    })),
    avgWeekly: scaleDollar(base.avgWeekly),
  };
}

function MetricsSection() {
  const [selectedJob, setSelectedJob] = useState("all");
  const [selectedLabor, setSelectedLabor] = useState("all");
  const [otThreshold, setOtThreshold] = useState(10);

  const jobData = useMemo(
    () => applyLaborFilter(METRICS_BY_JOB[selectedJob], selectedLabor),
    [selectedJob, selectedLabor]
  );
  const maxAmount = useMemo(
    () => Math.max(...jobData.weeklyNetPay.map((w) => w.amount)),
    [jobData]
  );

  const selectedLabel = JOB_OPTIONS.find((o) => o.value === selectedJob)?.label ?? "All Jobs";
  const selectedLaborLabel = LABOR_OPTIONS.find((o) => o.value === selectedLabor)?.label ?? "All Types";

  const handleJobSelect = useCallback(
    (event: CustomEvent<{ value: string }>) => {
      const value = event.detail.value;
      if (value && METRICS_BY_JOB[value]) {
        setSelectedJob(value);
      }
    },
    []
  );

  const handleLaborSelect = useCallback(
    (event: CustomEvent<{ value: string }>) => {
      const value = event.detail.value;
      if (value) {
        setSelectedLabor(value);
      }
    },
    []
  );

  const handleOtThresholdSelect = useCallback(
    (event: CustomEvent<{ value: string }>) => {
      const value = parseInt(event.detail.value, 10);
      if (value > 0) {
        setOtThreshold(value);
      }
    },
    []
  );

  return (
    <div className="bg-background border-default rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-foreground">Payroll Metrics</div>
          <i className="modus-icons text-2xl text-muted-foreground">bar_graph</i>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-foreground-60">Job:</div>
            <ModusDropdownMenu
              menuItems={JOB_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.value,
                selected: opt.value === selectedJob,
              }))}
              buttonContent={
                <div className="flex items-center gap-2">
                  <div className="text-sm">{selectedLabel}</div>
                  <i className="modus-icons text-sm">expand_more</i>
                </div>
              }
              buttonVariant="outlined"
              buttonColor="tertiary"
              buttonSize="sm"
              onItemSelect={handleJobSelect}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-foreground-60">Labor:</div>
            <ModusDropdownMenu
              menuItems={LABOR_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.value,
                selected: opt.value === selectedLabor,
              }))}
              buttonContent={
                <div className="flex items-center gap-2">
                  <div className="text-sm">{selectedLaborLabel}</div>
                  <i className="modus-icons text-sm">expand_more</i>
                </div>
              }
              buttonVariant="outlined"
              buttonColor="tertiary"
              buttonSize="sm"
              onItemSelect={handleLaborSelect}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {jobData.metrics.map((metric) => (
          <div
            key={`metric-${metric.label}`}
            className="border-default rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <i className="modus-icons text-sm text-primary-foreground">
                  {metric.icon}
                </i>
              </div>
              <div className="text-xs text-foreground-60">{metric.label}</div>
            </div>
            <div className="text-xl font-bold text-foreground">
              {metric.value}
            </div>
            {metric.trend && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${metric.trendUp ? "text-success" : "text-destructive"}`}>
                <i className="modus-icons text-xs">
                  {metric.trendUp ? "arrow_up" : "arrow_down"}
                </i>
                <div>{metric.trend} vs prior period</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-default rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-foreground">
            8-Week Trailing Average: Weekly Net Pay
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <div className="text-xs text-foreground-60">Net Pay</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-warning" />
              <div className="text-xs text-foreground-60">OT Hours</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-foreground-60">OT Alert:</div>
              <ModusDropdownMenu
                menuItems={OT_THRESHOLD_OPTIONS.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                  selected: opt.value === String(otThreshold),
                }))}
                buttonContent={
                  <div className="flex items-center gap-2">
                    <div className="text-sm">{`>${otThreshold}h`}</div>
                    <i className="modus-icons text-sm">expand_more</i>
                  </div>
                }
                buttonVariant="outlined"
                buttonColor="tertiary"
                buttonSize="sm"
                onItemSelect={handleOtThresholdSelect}
              />
            </div>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {jobData.weeklyNetPay.map((week) => {
            const heightPct = Math.round((week.amount / maxAmount) * 100);
            return (
              <div
                key={`week-${week.week}`}
                className="flex-1 flex flex-col items-center h-full"
              >
                <div className="text-xs font-semibold text-foreground mb-1">
                  ${(week.amount / 1000).toFixed(1)}k
                </div>
                <div className="flex-1 w-full flex flex-col justify-end">
                  <div
                    className="w-full bg-primary rounded-t-sm hover:bg-primary-80 transition-colors"
                    style={{ height: `${heightPct}%`, minHeight: "4px" }}
                  />
                </div>
                <div className={`text-xs font-semibold mt-1 ${week.overtimeHrs > otThreshold ? "text-warning" : "text-foreground-60"}`}>
                  {week.overtimeHrs > 0 ? `${week.overtimeHrs}h OT` : "--"}
                </div>
                <div className="text-xs text-foreground-60 whitespace-nowrap">
                  {week.week}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PayrollHomePage() {
  usePageTitle("Payroll");
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto h-full overflow-auto">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div
          role="heading"
          aria-level={1}
          className="text-2xl text-foreground"
        >
          Payroll Home
        </div>
        <div
          className="flex items-center gap-3 rounded-xl border border-warning bg-warning-20 px-4 py-2.5 cursor-pointer hover:bg-warning-40 transition-colors"
          role="button"
          tabIndex={0}
          aria-label="Start onboarding demo"
          onClick={() => navigate("/payroll/setup?demo=true")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/payroll/setup?demo=true"); }}
        >
          <i className="modus-icons text-warning text-lg leading-none">play</i>
          <div className="flex flex-col min-w-0">
            <div className="text-sm font-semibold text-foreground leading-tight">Start Onboarding Demo</div>
            <div className="text-xs text-muted-foreground">Walk through the full setup flow</div>
          </div>
          <i className="modus-icons text-muted-foreground text-base leading-none">chevron_right</i>
        </div>
      </div>

      {/* Payroll Metrics - Full width */}
      <div className="mb-6">
        <MetricsSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Tasks - Onboarding */}
          <div className="bg-background border-default rounded-lg p-6">
            <SectionHeader title="Tasks" icon="clipboard" />
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-base font-bold text-foreground">
                  Onboarding
                </div>
                <div className="text-sm text-foreground-60 mt-1">
                  Let&apos;s get you setup to start using Payroll Financials Go.
                </div>
              </div>
              <ModusButton
                color="primary"
                variant="outlined"
                size="md"
                icon="arrow_right"
                iconPosition="right"
                onButtonClick={() => navigate("/payroll/setup")}
              >
                Open payroll setup
              </ModusButton>
            </div>
            <div>
              {SETUP_TASKS.map((task) => (
                <TaskRow key={`setup-${task.title}`} task={task} />
              ))}
            </div>
          </div>

          {/* To Do */}
          <div className="bg-background border-default rounded-lg p-6">
            <SectionHeader title="To Do" icon="todo" />
            <div>
              {TODO_TASKS.map((task) => (
                <TaskRow key={`todo-${task.title}`} task={task} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ActivityCard />
          <DeadlineTrackerCard />
          <QuickActionsCard />
          <ResourcesCard />
        </div>
      </div>
    </div>
  );
}
