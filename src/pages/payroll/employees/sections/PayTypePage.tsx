import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePageTitle from "../../../../hooks/usePageTitle";
import ModusButton from "../../../../components/ModusButton";
import ModusTextInput from "../../../../components/ModusTextInput";
import { getEmployeeById } from "../../../../data/employees";

type PayType = "hourly" | "salary";

export default function PayTypePage() {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const employee = getEmployeeById(employeeId || "");

  usePageTitle(employee ? `${employee.name} - Pay Type` : "Pay Type");

  const [payType, setPayType] = useState<PayType | null>(null);
  const [annualSalary, setAnnualSalary] = useState("75000.00");

  const handleBackClick = useCallback(() => {
    navigate(`/payroll/employees/${employeeId}`);
  }, [navigate, employeeId]);

  const handleSalaryChange = useCallback(
    (event: CustomEvent<InputEvent>) => {
      const target = event.target as HTMLInputElement;
      setAnnualSalary(target.value || "");
    },
    []
  );

  if (!employee) {
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
          <div className="text-2xl font-bold text-foreground">Pay Type</div>
        </div>
        <div className="bg-background border-default rounded-lg p-6 text-center">
          <div className="text-muted-foreground">Employee not found.</div>
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
        <div className="text-2xl font-bold text-foreground">Pay Type</div>
        <i className="modus-icons text-lg text-warning">warning</i>
      </div>
      <div className="text-sm text-muted-foreground mb-6 ml-8">
        {employee.name} - {employee.role}
      </div>

      <div className="bg-background border-default rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <i className="modus-icons text-lg text-primary">monetarization</i>
          <div className="text-base font-semibold text-foreground">
            Compensation Type
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Select how this employee is compensated.
        </div>

        <div className="flex flex-col gap-3">
          <div
            role="radio"
            aria-checked={payType === "hourly"}
            tabIndex={0}
            onClick={() => setPayType("hourly")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setPayType("hourly");
              }
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${
              payType === "hourly"
                ? "border-primary bg-muted"
                : "border-transparent bg-muted hover:bg-muted"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                payType === "hourly"
                  ? "border-primary"
                  : "border-muted-foreground"
              }`}
            >
              {payType === "hourly" && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Hourly</div>
              <div className="text-xs text-muted-foreground">
                Employee is paid based on hours worked
              </div>
            </div>
          </div>

          <div
            role="radio"
            aria-checked={payType === "salary"}
            tabIndex={0}
            onClick={() => setPayType("salary")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setPayType("salary");
              }
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${
              payType === "salary"
                ? "border-primary bg-muted"
                : "border-transparent bg-muted hover:bg-muted"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                payType === "salary"
                  ? "border-primary"
                  : "border-muted-foreground"
              }`}
            >
              {payType === "salary" && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Salary</div>
              <div className="text-xs text-muted-foreground">
                Employee receives a fixed annual salary
              </div>
            </div>
          </div>
        </div>

        {payType === "salary" && (
          <div className="mt-5 pt-4 border-top-default">
            <ModusTextInput
              label="Annual Salary"
              value={annualSalary}
              placeholder="0.00"
              onInputChange={handleSalaryChange}
              required
            />
            <div className="text-xs text-muted-foreground mt-2">
              Enter the gross annual salary before deductions.
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-top-default pt-4">
        <ModusButton
          color="secondary"
          variant="outlined"
          size="md"
          onButtonClick={handleBackClick}
        >
          Cancel
        </ModusButton>
        <ModusButton
          color="primary"
          variant="filled"
          size="md"
          onButtonClick={handleBackClick}
        >
          Save
        </ModusButton>
      </div>
    </div>
  );
}
