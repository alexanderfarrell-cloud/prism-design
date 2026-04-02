import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import ModusButton from "../components/ModusButton";

interface ReportType {
  icon: string;
  title: string;
}

const REPORT_TYPES: ReportType[] = [
  { icon: "bar_graph", title: "Balance Sheet" },
  { icon: "bar_graph", title: "Income Statement" },
  { icon: "bar_graph", title: "Statement of Owner's Equity" },
  { icon: "bar_graph", title: "Trial Balance" },
];

function ReportCard({ report }: { report: ReportType }) {
  return (
    <div className="bg-background border-default rounded-lg px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-muted transition-colors">
      <i className="modus-icons text-xl text-primary">{report.icon}</i>
      <div className="text-base font-bold text-foreground">{report.title}</div>
    </div>
  );
}

export default function ReportsPage() {
  usePageTitle("Reports");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-6 pt-6 overflow-auto max-w-6xl mx-auto w-full">
        <div className="text-2xl text-foreground">Reports Hub</div>
        <div className="text-base font-bold text-foreground mb-6">
          Select the type of report you want to generate
        </div>

        <div className="max-w-3xl flex flex-col gap-3">
          {REPORT_TYPES.map((report) => (
            <ReportCard key={`report-${report.title}`} report={report} />
          ))}
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
      </div>
    </div>
  );
}
