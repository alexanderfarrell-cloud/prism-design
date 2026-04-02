import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../../hooks/usePageTitle";
import ModusButton from "../../../components/ModusButton";
import ModusTextInput from "../../../components/ModusTextInput";
import ModusBadge from "../../../components/ModusBadge";
import ModusChip from "../../../components/ModusChip";
import ModusAvatar from "../../../components/ModusAvatar";
import { EMPLOYEES } from "../../../data/employees";
import type { Employee } from "../../../data/employees";

function EmployeeCard({
  employee,
  onClick,
}: {
  employee: Employee;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="border-l-4 border-l-primary border-default rounded-lg bg-card px-5 py-4 flex gap-4 cursor-pointer hover:bg-muted transition-colors"
    >
      <div className="flex-shrink-0 pt-1">
        <ModusAvatar
          alt={employee.name}
          imgSrc={employee.avatarUrl}
          initials={employee.initials}
          shape="circle"
          size="lg"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="text-lg font-semibold text-foreground">
              {employee.name}
            </div>
            <div className="text-sm text-muted-foreground">{employee.role}</div>
          </div>
          <ModusBadge
            color={employee.status === "Active" ? "success" : "secondary"}
            variant="filled"
            size="sm"
          >
            {employee.status}
          </ModusBadge>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <i className="modus-icons text-sm text-muted-foreground">email</i>
            <div>{employee.email}</div>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <i className="modus-icons text-sm text-muted-foreground">phone</i>
            <div>{employee.phone}</div>
          </div>
          <div className="text-sm text-foreground mt-1">
            Employee ID: {employee.id}
          </div>
        </div>

        {employee.defaultJob && (
          <div className="flex flex-wrap gap-2 mt-3">
            <ModusChip
              size="sm"
              variant="outline"
              label={`${employee.defaultJob}  ${employee.projects.find((p) => p.name === employee.defaultJob)?.dateRange || ""}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function PayrollEmployeesPage() {
  usePageTitle("Payroll - Employees");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = EMPLOYEES.filter((emp) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.id.toLowerCase().includes(query)
    );
  });

  const handleSearchChange = useCallback((event: CustomEvent<InputEvent>) => {
    const target = event.target as HTMLInputElement;
    setSearchQuery(target.value || "");
  }, []);

  const handleEmployeeClick = useCallback(
    (employeeId: string) => {
      navigate(`/payroll/employees/${employeeId}`);
    },
    [navigate]
  );

  const handleBackClick = useCallback(() => {
    navigate("/payroll");
  }, [navigate]);

  return (
    <div className="p-6 max-w-4xl mx-auto h-full overflow-auto">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
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
          <div className="text-2xl font-bold text-foreground">Employees</div>
        </div>
        <ModusButton
          color="primary"
          variant="filled"
          icon="add"
          iconPosition="left"
          size="md"
        >
          New Employee
        </ModusButton>
      </div>

      <div className="text-sm text-muted-foreground mb-4 ml-8">
        Set up employee profiles with personal and payment information.
      </div>

      <ModusTextInput
        placeholder="Search employees..."
        includeSearch
        value={searchQuery}
        onInputChange={handleSearchChange}
        aria-label="Search employees"
      />

      <div className="flex flex-col gap-3 mt-4">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onClick={() => handleEmployeeClick(employee.id)}
          />
        ))}

        {filteredEmployees.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No employees match your search.
          </div>
        )}
      </div>
    </div>
  );
}
