import ModusLogo from "../../../components/ModusLogo";

interface WizardHeaderProps {
  demoMode?: boolean;
}

export default function WizardHeader({ demoMode = false }: WizardHeaderProps) {
  return (
    <div className="px-6 py-4 flex items-center justify-between border-bottom-default">
      <ModusLogo name="financials" />
      {demoMode && (
        <div className="flex items-center gap-1.5 rounded-full bg-warning-20 border border-warning px-3 py-1 text-xs font-semibold text-warning">
          <i className="modus-icons text-sm leading-none">play</i>
          Demo
        </div>
      )}
    </div>
  );
}
