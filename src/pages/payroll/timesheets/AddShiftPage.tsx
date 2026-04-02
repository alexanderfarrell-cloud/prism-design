import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import usePageTitle from "../../../hooks/usePageTitle";
import ModusButton from "../../../components/ModusButton";
import ModusTextInput from "../../../components/ModusTextInput";
import { getEmployeeById } from "../../../data/employees";
import { getDefaultLaborType, LABOR_TYPES } from "../../../data/laborTypes";

const AVAILABLE_JOBS = [
  "Downtown Crossing",
  "Riverside Plaza",
  "Martingale Wharf",
  "Riverfront Plaza",
  "Cedar Heights Tower",
  "Elm Street Bridge",
  "Harbor View Tower",
];

const AVAILABLE_ACTIVITIES = [
  "Framing - Interior Walls",
  "Framing - Exterior Walls",
  "Electrical Rough-In",
  "Electrical Finish",
  "Plumbing Rough-In",
  "Plumbing Finish",
  "Concrete Pour",
  "Concrete Finish",
  "Steel Framing",
  "Roofing",
  "Drywall Hanging",
  "Drywall Finishing",
  "Painting - Interior",
  "Painting - Exterior",
  "Site Cleanup",
  "Equipment Cleanup",
  "Demolition",
  "Excavation",
  "Grading",
  "Inspection",
  "Safety Walkthrough",
];

const AVAILABLE_LABOR_TYPES = LABOR_TYPES.map((lt) => lt.label);

function DropdownField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="text-xs font-medium text-muted-foreground mb-1">
        {label}
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className="flex items-center justify-between px-3 py-2 border-default rounded-md bg-background cursor-pointer hover:bg-muted transition-colors"
      >
        <div
          className={`text-sm ${value ? "text-foreground" : "text-muted-foreground"}`}
        >
          {value || "Select..."}
        </div>
        <i
          className={`modus-icons text-xs text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          expand_more
        </i>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border-default rounded-md elevation-2 z-50 max-h-48 overflow-auto">
          {options.map((option) => (
            <div
              key={option}
              role="option"
              aria-selected={option === value}
              tabIndex={0}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(option);
                  setIsOpen(false);
                }
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                option === value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddShiftPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  usePageTitle("Add Shift");

  const employee = employeeId ? getEmployeeById(employeeId) : undefined;
  const defaultLaborType = employee
    ? getDefaultLaborType(employee.laborTypes)
    : undefined;

  const [job, setJob] = useState(employee?.defaultJob || "");
  const [activity, setActivity] = useState("");
  const [laborType, setLaborType] = useState(defaultLaborType?.name || "");
  const [laborCode, setLaborCode] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  const handleBackClick = useCallback(() => {
    navigate("/payroll/timesheets", { state: { employeeId } });
  }, [navigate, employeeId]);

  const handleSave = useCallback(() => {
    navigate(`/payroll/employees/${employeeId}/timecard`);
  }, [navigate, employeeId]);

  const advanceDate = useCallback((dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    date.setDate(date.getDate() + 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const handleSaveAndCopy = useCallback(() => {
    setSavedCount((prev) => prev + 1);
    setShiftDate((prev) => advanceDate(prev));
    setNotes("");
  }, [advanceDate]);

  const handleDateChange = useCallback((event: CustomEvent<InputEvent>) => {
    const target = event.target as HTMLInputElement;
    setShiftDate(target.value || "");
  }, []);

  const handleStartTimeChange = useCallback(
    (event: CustomEvent<InputEvent>) => {
      const target = event.target as HTMLInputElement;
      setStartTime(target.value || "");
    },
    []
  );

  const handleEndTimeChange = useCallback(
    (event: CustomEvent<InputEvent>) => {
      const target = event.target as HTMLInputElement;
      setEndTime(target.value || "");
    },
    []
  );

  const handleHoursChange = useCallback((event: CustomEvent<InputEvent>) => {
    const target = event.target as HTMLInputElement;
    setHours(target.value || "");
  }, []);

  const handleLaborCodeChange = useCallback(
    (event: CustomEvent<InputEvent>) => {
      const target = event.target as HTMLInputElement;
      setLaborCode(target.value || "");
    },
    []
  );

  const handleNotesChange = useCallback((event: CustomEvent<InputEvent>) => {
    const target = event.target as HTMLInputElement;
    setNotes(target.value || "");
  }, []);

  if (!employee) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <i className="modus-icons text-4xl text-muted-foreground mb-4">
            warning
          </i>
          <div className="text-lg font-semibold text-foreground mb-2">
            Employee Not Found
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            The employee you are looking for does not exist.
          </div>
          <ModusButton
            color="primary"
            variant="outlined"
            onButtonClick={handleBackClick}
          >
            Back to Timesheets
          </ModusButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto h-full overflow-auto">
      {/* Header */}
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
          <div className="text-2xl font-bold text-foreground">Add Shift</div>
        </div>

        <div className="flex gap-2">
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
            variant="outlined"
            icon="copy_content"
            iconPosition="left"
            size="md"
            onButtonClick={handleSaveAndCopy}
          >
            Save and Copy
          </ModusButton>
          <ModusButton
            color="primary"
            variant="filled"
            icon="check"
            iconPosition="left"
            size="md"
            onButtonClick={handleSave}
          >
            Save Shift
          </ModusButton>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-6 ml-8">
        {employee.name} - {employee.role}
      </div>

      {/* Saved Confirmation */}
      {savedCount > 0 && (
        <div className="bg-success-20 border-success rounded-lg px-4 py-3 mb-2 flex items-center gap-2">
          <i className="modus-icons text-base text-success">check_circle</i>
          <div className="text-sm text-success font-medium">
            Shift saved ({savedCount} {savedCount === 1 ? "shift" : "shifts"} added) -- date advanced to next day. Continue filling out the week.
          </div>
        </div>
      )}

      {/* Form */}
      <div className="flex flex-col gap-6">
        {/* Date & Job Section */}
        <div className="bg-card border-default rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="modus-icons text-lg text-primary">calendar</i>
            <div className="text-base font-semibold text-foreground">
              Shift Details
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModusTextInput
              label="Date"
              value={shiftDate}
              type="date"
              required
              onInputChange={handleDateChange}
            />

            <DropdownField
              label="Job"
              value={job}
              options={
                employee.projects.length > 0
                  ? employee.projects.map((p) => p.name)
                  : AVAILABLE_JOBS
              }
              onChange={setJob}
            />
          </div>
        </div>

        {/* Activity & Labor Section */}
        <div className="bg-card border-default rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="modus-icons text-lg text-primary">wrench</i>
            <div className="text-base font-semibold text-foreground">
              Activity
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <DropdownField
              label="Activity"
              value={activity}
              options={AVAILABLE_ACTIVITIES}
              onChange={setActivity}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropdownField
                label="Labor Type"
                value={laborType}
                options={AVAILABLE_LABOR_TYPES}
                onChange={setLaborType}
              />

              <ModusTextInput
                label="Labor Code"
                value={laborCode}
                placeholder="e.g. C1-FR"
                onInputChange={handleLaborCodeChange}
              />
            </div>
          </div>
        </div>

        {/* Time Section */}
        <div className="bg-card border-default rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="modus-icons text-lg text-primary">clock</i>
            <div className="text-base font-semibold text-foreground">Time</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModusTextInput
              label="Start Time"
              value={startTime}
              type="time"
              required
              onInputChange={handleStartTimeChange}
            />
            <ModusTextInput
              label="End Time"
              value={endTime}
              type="time"
              required
              onInputChange={handleEndTimeChange}
            />
            <ModusTextInput
              label="Hours"
              value={hours}
              type="number"
              placeholder="0.0"
              onInputChange={handleHoursChange}
            />
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-card border-default rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="modus-icons text-lg text-primary">document</i>
            <div className="text-base font-semibold text-foreground">Notes</div>
          </div>

          <ModusTextInput
            label="Notes (optional)"
            value={notes}
            placeholder="Add any notes about this shift..."
            onInputChange={handleNotesChange}
          />
        </div>

        {/* Defaults Info */}
        <div className="bg-muted rounded-lg px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="modus-icons text-base text-muted-foreground">info</i>
            <div className="text-sm font-medium text-foreground">
              Employee Defaults
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
            <div className="text-xs text-muted-foreground">
              Default Job:{" "}
              <div className="inline font-medium text-foreground">
                {employee.defaultJob || "None"}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Default Labor Type:{" "}
              <div className="inline font-medium text-foreground">
                {defaultLaborType?.name || "None"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
