import usePageTitle from "../../hooks/usePageTitle";

export default function PayrollCompliancePage() {
  usePageTitle("Payroll - Compliance");
  return (
    <div className="p-6 max-w-6xl mx-auto h-full overflow-auto">
      <div className="text-2xl font-bold text-foreground mb-4">Compliance</div>
      <div className="text-foreground-60 mb-6">
        Track regulatory compliance, authorization status, and filing deadlines.
      </div>
      <div className="bg-card border-default rounded-lg p-6">
        <div className="text-lg font-semibold text-foreground mb-2">
          Compliance Dashboard
        </div>
        <div className="text-sm text-foreground-60">
          Monitor your compliance status across all jurisdictions.
        </div>
      </div>
    </div>
  );
}
