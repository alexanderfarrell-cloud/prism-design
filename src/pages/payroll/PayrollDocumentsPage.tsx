import usePageTitle from "../../hooks/usePageTitle";

export default function PayrollDocumentsPage() {
  usePageTitle("Payroll - Documents");
  return (
    <div className="p-6 max-w-6xl mx-auto h-full overflow-auto">
      <div className="text-2xl font-bold text-foreground mb-4">Documents</div>
      <div className="text-foreground-60 mb-6">
        Access payroll documents, tax forms, and authorization paperwork.
      </div>
      <div className="bg-card border-default rounded-lg p-6">
        <div className="text-lg font-semibold text-foreground mb-2">
          Document Library
        </div>
        <div className="text-sm text-foreground-60">
          No documents have been generated yet.
        </div>
      </div>
    </div>
  );
}
