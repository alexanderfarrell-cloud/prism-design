import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePageTitle from "../../../../hooks/usePageTitle";
import ModusButton from "../../../../components/ModusButton";
import { getEmployeeById } from "../../../../data/employees";
import { TIMESHEET_DATA } from "../../../../data/timesheets";
import type { TimesheetDay } from "../../../../data/timesheets";

function WeeklySummary({ days }: { days: TimesheetDay[] }) {
  const totalHours = days.reduce((sum, d) => sum + d.totalHours, 0);
  const regularHours = days.reduce((sum, d) => sum + d.regularHours, 0);
  const overtimeHours = days.reduce((sum, d) => sum + d.overtimeHours, 0);
  const daysWorked = days.filter((d) => d.totalHours > 0).length;

  return (
    <div className="flex flex-wrap items-stretch gap-4 mb-6">
      <div className="flex-1 min-w-[120px] bg-card border-default rounded-lg px-5 py-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-primary">
          {totalHours.toFixed(1)}h
        </div>
        <div className="text-xs text-muted-foreground mt-1">Total Hours</div>
      </div>

      <div className="flex-1 min-w-[120px] bg-card border-default rounded-lg px-5 py-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-foreground">
          {regularHours.toFixed(1)}h
        </div>
        <div className="text-xs text-muted-foreground mt-1">Regular</div>
      </div>

      {overtimeHours > 0 && (
        <div className="flex-1 min-w-[120px] bg-card border-default rounded-lg px-5 py-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-warning">
            {overtimeHours.toFixed(1)}h
          </div>
          <div className="text-xs text-muted-foreground mt-1">Overtime</div>
        </div>
      )}

      <div className="flex-1 min-w-[120px] bg-card border-default rounded-lg px-5 py-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-foreground">{daysWorked}</div>
        <div className="text-xs text-muted-foreground mt-1">Days Worked</div>
      </div>
    </div>
  );
}

function DayRow({
  day,
  onClick,
}: {
  day: TimesheetDay;
  onClick: () => void;
}) {
  const statusIcon =
    day.status === "complete"
      ? "check_circle"
      : day.status === "warning"
        ? "warning"
        : "remove_circle";
  const statusColor =
    day.status === "complete"
      ? "text-success"
      : day.status === "warning"
        ? "text-warning"
        : "text-muted-foreground";

  const isEmpty = day.totalHours === 0;

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
      className={`flex items-center gap-4 px-4 py-4 bg-card border-default rounded-lg cursor-pointer hover:bg-muted transition-colors ${isEmpty ? "opacity-60" : ""}`}
    >
      <i className={`modus-icons text-xl ${statusColor}`}>{statusIcon}</i>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-foreground">
            {day.dayLabel}
          </div>
          <div className="text-xs text-muted-foreground">{day.date}</div>
          {day.alert && (
            <i className="modus-icons text-xs text-destructive">warning</i>
          )}
        </div>
        {day.job && (
          <div className="text-xs text-muted-foreground mt-0.5">{day.job}</div>
        )}
        {day.activities.length > 0 && (
          <div className="text-xs text-muted-foreground-60 mt-0.5">
            {day.activities.length} activit{day.activities.length === 1 ? "y" : "ies"}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {day.overtimeHours > 0 && (
          <div className="text-xs text-warning font-medium">
            +{day.overtimeHours.toFixed(1)}h OT
          </div>
        )}
        <div
          className={`text-base font-bold ${isEmpty ? "text-muted-foreground" : "text-foreground"}`}
        >
          {isEmpty ? "--" : `${day.totalHours.toFixed(1)}h`}
        </div>
        <i className="modus-icons text-lg text-muted-foreground">
          chevron_right
        </i>
      </div>
    </div>
  );
}

export default function TimecardPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const employee = getEmployeeById(employeeId || "");

  usePageTitle(
    employee ? `${employee.name} - Timecard` : "Timecard"
  );

  const handleBackClick = useCallback(() => {
    navigate(`/payroll/employees/${employeeId}`);
  }, [navigate, employeeId]);

  const handleDayClick = useCallback(
    (dayIndex: number) => {
      navigate(`/payroll/timesheets/${employeeId}/${dayIndex}`);
    },
    [navigate, employeeId]
  );

  const handleAddShift = useCallback(() => {
    navigate(`/payroll/timesheets/${employeeId}/add-shift`);
  }, [navigate, employeeId]);

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
          <div className="text-2xl font-bold text-foreground">Timecard</div>
        </div>
        <div className="bg-card border-default rounded-lg p-6 text-center">
          <div className="text-muted-foreground">Employee not found.</div>
        </div>
      </div>
    );
  }

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
          <div className="text-2xl font-bold text-foreground">Timecard</div>
        </div>

        <ModusButton
          color="primary"
          variant="filled"
          icon="add"
          iconPosition="left"
          size="md"
          onButtonClick={handleAddShift}
        >
          Add Shift
        </ModusButton>
      </div>
      <div className="text-sm text-muted-foreground mb-6 ml-8">
        {employee.name} - {employee.role}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <i className="modus-icons text-lg text-primary">calendar</i>
        <div className="text-base font-semibold text-foreground">
          Week of 3/1/2026 - 3/7/2026
        </div>
      </div>

      <WeeklySummary days={TIMESHEET_DATA} />

      <div className="flex flex-col gap-3">
        {TIMESHEET_DATA.map((day, index) => (
          <DayRow
            key={`${day.dayLabel}-${index}`}
            day={day}
            onClick={() => handleDayClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
