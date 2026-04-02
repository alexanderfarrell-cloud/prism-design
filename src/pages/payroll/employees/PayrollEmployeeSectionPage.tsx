import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePageTitle from "../../../hooks/usePageTitle";
import { getEmployeeById } from "../../../data/employees";
import { DETAIL_SECTIONS } from "../../../data/detailSections";

export default function PayrollEmployeeSectionPage() {
  const navigate = useNavigate();
  const { employeeId, sectionId } = useParams<{
    employeeId: string;
    sectionId: string;
  }>();

  const employee = getEmployeeById(employeeId || "");
  const section = DETAIL_SECTIONS.find((s) => s.id === sectionId);

  usePageTitle(
    section && employee
      ? `${employee.name} - ${section.label}`
      : "Employee Section"
  );

  const handleBackClick = useCallback(() => {
    navigate(`/payroll/employees/${employeeId}`);
  }, [navigate, employeeId]);

  if (!employee || !section) {
    return (
      <div className="p-6 max-w-4xl mx-auto h-full overflow-auto">
        <div className="flex items-center gap-2 mb-6">
          <div
            role="button"
            tabIndex={0}
            onClick={handleBackClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleBackClick();
              }
            }}
            className="cursor-pointer text-foreground hover:text-primary transition-colors"
          >
            <i className="modus-icons text-xl">chevron_left</i>
          </div>
          <div className="text-2xl font-bold text-foreground">
            Section Not Found
          </div>
        </div>
        <div className="bg-card border-default rounded-lg p-6 text-center">
          <div className="text-muted-foreground">
            The requested section could not be found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto h-full overflow-auto">
      <div className="flex items-center gap-2 mb-1">
        <div
          role="button"
          tabIndex={0}
          onClick={handleBackClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleBackClick();
            }
          }}
          className="cursor-pointer text-foreground hover:text-primary transition-colors"
        >
          <i className="modus-icons text-xl">chevron_left</i>
        </div>
        <div className="text-2xl font-bold text-foreground">
          {section.label}
        </div>
        {section.hasWarning && (
          <i className="modus-icons text-lg text-warning">warning</i>
        )}
      </div>
      <div className="text-sm text-muted-foreground mb-6 ml-8">
        {employee.name} - {employee.role}
      </div>

      <div className="bg-card border-default rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <i className="modus-icons text-2xl text-primary">{section.icon}</i>
          <div className="text-lg font-semibold text-foreground">
            {section.label}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Manage {section.label.toLowerCase()} for {employee.name}. Details and
          forms will be available here.
        </div>
      </div>
    </div>
  );
}
