import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import usePageTitle from "../../../hooks/usePageTitle";
import ModusButton from "../../../components/ModusButton";
import { EMPLOYEES } from "../../../data/employees";
import { TIMESHEET_DATA } from "../../../data/timesheets";
import type { TimesheetDay } from "../../../data/timesheets";

function formatDateRange(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  return `${fmt(start)} - ${fmt(end)}`;
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function formatSingleDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function TimesheetCard({
  day,
  onClick,
}: {
  day: TimesheetDay;
  onClick?: () => void;
}) {
  const needsOvertimeReview = day.totalHours > 8;

  const borderColor = needsOvertimeReview
    ? "border-l-warning"
    : day.status === "warning"
      ? "border-l-destructive"
      : day.status === "complete"
        ? "border-l-success"
        : "border-l-muted-foreground";

  const statusIcon = needsOvertimeReview ? (
    <i className="modus-icons text-lg text-warning">warning</i>
  ) : day.status === "warning" ? (
    <i className="modus-icons text-lg text-destructive">cancel_circle</i>
  ) : day.status === "complete" ? (
    <i className="modus-icons text-lg text-success">check_circle</i>
  ) : null;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`border-l-4 ${borderColor} border-default rounded-lg bg-primary-5 flex flex-col h-full ${onClick ? "cursor-pointer hover:bg-muted transition-colors" : ""}`}
    >
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <div className="text-sm font-medium text-foreground">
                {day.dayLabel}
              </div>
              <div className="text-lg font-bold text-foreground">
                {day.totalHours.toFixed(1)}h
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{day.date}</div>
          </div>
          {statusIcon}
        </div>
      </div>

      <div className="flex-1 px-4">
        {day.activities.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No entry
          </div>
        ) : (
          <>
            {day.job && (
              <div className="mb-3 pt-1">
                <div className="text-[10px] text-muted-foreground">Job</div>
                <div className="flex items-center gap-1.5">
                  <i className="modus-icons text-xs text-muted-foreground">
                    building_corporate
                  </i>
                  <div className="text-sm font-semibold text-foreground">
                    {day.job}
                  </div>
                </div>
              </div>
            )}

            {day.activities.map((act, idx) => (
              <div
                key={`${day.dayLabel}-${idx}`}
                className={`py-2 ${idx > 0 ? "border-top-default" : ""}`}
              >
                <div className="text-[10px] text-muted-foreground">
                  Activity
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="modus-icons text-xs text-muted-foreground">
                    wrench
                  </i>
                  <div className="text-sm font-semibold text-foreground">
                    {act.activity}
                  </div>
                </div>
                <div className="ml-5 mt-0.5">
                  <div className="text-[10px] text-muted-foreground">
                    Labor Type
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="modus-icons text-xs text-muted-foreground">
                      person
                    </i>
                    <div className="text-xs font-semibold text-foreground">
                      {act.laborType}
                      {act.laborCode && (
                        <div className="inline text-xs font-normal text-muted-foreground">
                          ({act.laborCode})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 ml-5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <i className="modus-icons text-xs">clock</i>
                    <div>
                      {act.startTime} - {act.endTime}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-success">
                    {act.hours.toFixed(1)}h
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {day.activities.length > 0 && (
        <div className="px-4 pb-3 mt-auto">
          <div className="border-top-default pt-2 mt-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <div>Regular</div>
              <div className="font-medium text-foreground">
                {day.regularHours.toFixed(1)}h
              </div>
            </div>
            {day.overtimeHours > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <div>Overtime</div>
                <div className="font-medium text-success">
                  {day.overtimeHours.toFixed(1)}h
                </div>
              </div>
            )}
            <div className="flex justify-between text-sm mt-1">
              <div className="font-bold text-foreground">Total</div>
              <div className="font-bold text-foreground">
                {day.totalHours.toFixed(1)}h
              </div>
            </div>
          </div>

          {day.alert && (
            <div className="mt-2 pt-2 border-top-destructive">
              <div className="flex items-center gap-1 text-xs text-destructive">
                <i className="modus-icons text-xs">clock</i>
                <div>{day.alert}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PayrollTimesheetsPage() {
  usePageTitle("Payroll - Timesheets");
  const navigate = useNavigate();
  const location = useLocation();
  const incomingEmployeeId = (location.state as { employeeId?: string } | null)?.employeeId ?? "";
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 2, 4));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(incomingEmployeeId);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedEmployee = EMPLOYEES.find((e) => e.id === selectedEmployeeId);

  const handleBackClick = useCallback(() => {
    navigate("/payroll");
  }, [navigate]);

  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - (viewMode === "week" ? 7 : 1));
      return next;
    });
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + (viewMode === "week" ? 7 : 1));
      return next;
    });
  }, [viewMode]);

  const handleEmployeeSelect = useCallback((empId: string) => {
    setSelectedEmployeeId(empId);
    setEmployeeDropdownOpen(false);
  }, []);

  useEffect(() => {
    if (!employeeDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [employeeDropdownOpen]);

  const weekRange = getWeekRange(currentDate);
  const dateLabel =
    viewMode === "week"
      ? formatDateRange(weekRange.start, weekRange.end)
      : formatSingleDate(currentDate);

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
        <div className="text-2xl font-bold text-foreground">Timesheets</div>
      </div>

      <div className="text-sm text-muted-foreground mb-4 ml-8">
        Track and manage employee work hours and shifts.
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Day / Week Toggle */}
        <div className="flex border-default rounded-lg overflow-hidden">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setViewMode("day")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setViewMode("day");
              }
            }}
            className={`px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
              viewMode === "day"
                ? "bg-foreground text-background"
                : "bg-background text-foreground hover:bg-muted"
            }`}
          >
            Day
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setViewMode("week")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setViewMode("week");
              }
            }}
            className={`px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
              viewMode === "week"
                ? "bg-foreground text-background"
                : "bg-background text-foreground hover:bg-muted"
            }`}
          >
            Week
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-1 border-default rounded-lg px-2 py-1">
          <div
            role="button"
            tabIndex={0}
            onClick={handlePrev}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePrev();
              }
            }}
            className="cursor-pointer text-foreground hover:text-primary transition-colors p-0.5"
          >
            <i className="modus-icons text-base">chevron_left</i>
          </div>
          <div className="flex items-center gap-2 px-2">
            <i className="modus-icons text-base text-foreground">calendar</i>
            <div className="text-sm text-foreground whitespace-nowrap">
              {dateLabel}
            </div>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={handleNext}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleNext();
              }
            }}
            className="cursor-pointer text-foreground hover:text-primary transition-colors p-0.5"
          >
            <i className="modus-icons text-base">chevron_right</i>
          </div>
        </div>

        {/* Employee Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setEmployeeDropdownOpen((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setEmployeeDropdownOpen((prev) => !prev);
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 border-default rounded-lg bg-background cursor-pointer hover:bg-muted transition-colors"
          >
            <div className="text-sm text-foreground whitespace-nowrap">
              {selectedEmployee?.name || "Select Employee"}
            </div>
            <i
              className={`modus-icons text-xs text-muted-foreground transition-transform ${
                employeeDropdownOpen ? "rotate-180" : ""
              }`}
            >
              expand_more
            </i>
          </div>
          {employeeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-background border-default rounded-lg elevation-2 z-50 overflow-hidden">
              {EMPLOYEES.map((emp) => (
                <div
                  key={emp.id}
                  role="option"
                  aria-selected={emp.id === selectedEmployeeId}
                  tabIndex={0}
                  onClick={() => handleEmployeeSelect(emp.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleEmployeeSelect(emp.id);
                    }
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    emp.id === selectedEmployeeId
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {emp.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Shift Button */}
        <ModusButton
          color="primary"
          variant="filled"
          icon="add"
          iconPosition="left"
          size="sm"
          onButtonClick={() =>
            navigate(`/payroll/timesheets/${selectedEmployeeId}/add-shift`)
          }
        >
          Add Shift
        </ModusButton>
      </div>

      {/* Summary Metrics */}
      {(() => {
        const hasEmployee = !!selectedEmployeeId;
        const days = hasEmployee
          ? viewMode === "week"
            ? TIMESHEET_DATA
            : (() => {
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const match = TIMESHEET_DATA.find(
                  (d) => d.dayLabel === dayNames[currentDate.getDay()]
                );
                return match ? [match] : [];
              })()
          : [];
        const totalHours = days.reduce((sum, d) => sum + d.totalHours, 0);
        const regularHours = days.reduce((sum, d) => sum + d.regularHours, 0);
        const overtimeHours = days.reduce((sum, d) => sum + d.overtimeHours, 0);
        const daysWorked = days.filter((d) => d.totalHours > 0).length;

        return (
          <div className="flex flex-wrap items-stretch gap-4 mb-5">
            <div className="flex-1 min-w-[140px] bg-background border-default rounded-lg px-5 py-4 flex flex-col items-center">
              <div className={`text-3xl font-bold ${hasEmployee ? "text-primary" : "text-muted-foreground"}`}>
                {hasEmployee ? `${totalHours.toFixed(1)}h` : "--"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Total Hours
              </div>
            </div>
            <div className="flex-1 min-w-[140px] bg-background border-default rounded-lg px-5 py-4 flex flex-col items-center">
              <div className={`text-3xl font-bold ${hasEmployee ? "text-foreground" : "text-muted-foreground"}`}>
                {hasEmployee ? `${regularHours.toFixed(1)}h` : "--"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Regular</div>
            </div>
            <div className="flex-1 min-w-[140px] bg-background border-default rounded-lg px-5 py-4 flex flex-col items-center">
              <div
                className={`text-3xl font-bold ${hasEmployee && overtimeHours > 0 ? "text-warning" : "text-muted-foreground"}`}
              >
                {hasEmployee ? `${overtimeHours.toFixed(1)}h` : "--"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Overtime</div>
            </div>
            <div className="flex-1 min-w-[140px] bg-background border-default rounded-lg px-5 py-4 flex flex-col items-center">
              <div className={`text-3xl font-bold ${hasEmployee ? "text-foreground" : "text-muted-foreground"}`}>
                {hasEmployee ? daysWorked : "--"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {viewMode === "week" ? "Days Worked" : "Shifts"}
              </div>
            </div>
          </div>
        );
      })()}

      {!selectedEmployeeId ? (
        <div className="flex flex-col items-center justify-center py-12">
          <i className="modus-icons text-5xl text-muted-foreground mb-4">clock</i>
          <div className="text-lg font-semibold text-foreground mb-2">
            No Employee Selected
          </div>
          <div className="text-sm text-muted-foreground text-center max-w-md">
            Select an employee from the dropdown above to view and manage their timesheets.
          </div>
        </div>
      ) : (
        <>
          {/* Timecard Grid */}
          {viewMode === "week" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TIMESHEET_DATA.map((day, index) => (
                <TimesheetCard
                  key={day.dayLabel}
                  day={day}
                  onClick={() =>
                    navigate(
                      `/payroll/timesheets/${selectedEmployeeId}/${index}`
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="max-w-sm">
              {(() => {
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const dayLabel = dayNames[currentDate.getDay()];
                const dayIndex = TIMESHEET_DATA.findIndex(
                  (d) => d.dayLabel === dayLabel
                );
                const matchingDay = dayIndex >= 0 ? TIMESHEET_DATA[dayIndex] : undefined;
                return matchingDay ? (
                  <TimesheetCard
                    day={matchingDay}
                    onClick={() =>
                      navigate(
                        `/payroll/timesheets/${selectedEmployeeId}/${dayIndex}`
                      )
                    }
                  />
                ) : (
                  <div className="bg-primary-5 border-default rounded-lg p-6 text-center">
                    <div className="text-sm text-muted-foreground">
                      No timesheet data for this day.
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
