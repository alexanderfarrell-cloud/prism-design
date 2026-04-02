import usePageTitle from "../../hooks/usePageTitle";

export default function PayrollTaxSettingsPage() {
  usePageTitle("Payroll - Tax Settings");
  return (
    <div className="p-6 max-w-6xl mx-auto h-full overflow-auto">
      <div className="text-2xl font-bold text-foreground mb-4">Tax Settings</div>
      <div className="text-foreground-60 mb-6">
        Configure federal, state, and local tax filing and payment settings.
      </div>
      <div className="bg-card border-default rounded-lg p-6">
        <div className="text-lg font-semibold text-foreground mb-2">
          Tax Configuration
        </div>
        <div className="text-sm text-foreground-60">
          Set up your tax jurisdictions, filing frequencies, and payment methods.
        </div>
      </div>
    </div>
  );
}
