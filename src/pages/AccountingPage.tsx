import { useNavigate } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import ModusButton from "../components/ModusButton";

interface AccountingModule {
  icon: string;
  title: string;
  description: string;
}

const ACCOUNTING_MODULES: AccountingModule[] = [
  {
    icon: "file_edit",
    title: "Journal Entries",
    description: "Manual transactions that adjust account balances",
  },
];

function ModuleCard({ module }: { module: AccountingModule }) {
  return (
    <div className="bg-background border-default rounded-lg px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-muted transition-colors">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
        <i className="modus-icons text-xl text-foreground-60">
          {module.icon}
        </i>
      </div>
      <div>
        <div className="text-base font-bold text-foreground">
          {module.title}
        </div>
        <div className="text-sm text-foreground-60">{module.description}</div>
      </div>
    </div>
  );
}

export default function AccountingPage() {
  usePageTitle("Accounting");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-6 pt-6 overflow-auto max-w-6xl mx-auto w-full">
        <div className="text-2xl text-foreground mb-6">Accounting Hub</div>

        <div className="max-w-3xl flex flex-col gap-3">
          {ACCOUNTING_MODULES.map((module) => (
            <ModuleCard
              key={`module-${module.title}`}
              module={module}
            />
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
