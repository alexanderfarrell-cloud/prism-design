import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import usePageTitle from "../../../hooks/usePageTitle";
import ModusButton from "../../../components/ModusButton";
import ModusTextInput from "../../../components/ModusTextInput";
import { getTimesheetByIndex } from "../../../data/timesheets";
import { getEmployeeById } from "../../../data/employees";
import type { TimesheetActivity } from "../../../data/timesheets";

interface JobEntry {
  job: string;
  activities: TimesheetActivity[];
}

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

const AVAILABLE_LABOR_TYPES = [
  "Carpenter",
  "Electrician",
  "Laborer",
  "Equipment Operator",
  "Ironworker",
  "Plumber",
  "Foreman",
  "Project Manager",
  "Site Supervisor",
  "Safety Inspector",
];

function ReadOnlyField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2">
        {icon && (
          <i className="modus-icons text-sm text-muted-foreground">{icon}</i>
        )}
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

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
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
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
        <div className="text-sm text-foreground">{value || "Select..."}</div>
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

function ActivityCard({
  activity,
  index,
  isEditing,
  onUpdate,
  onDelete,
}: {
  activity: TimesheetActivity;
  index: number;
  isEditing: boolean;
  onUpdate: (index: number, updated: TimesheetActivity) => void;
  onDelete: (index: number) => void;
}) {
  const handleFieldChange = useCallback(
    (field: keyof TimesheetActivity, value: string | number) => {
      onUpdate(index, { ...activity, [field]: value });
    },
    [activity, index, onUpdate]
  );

  const handleHoursChange = useCallback(
    (event: CustomEvent<InputEvent>) => {
      const target = event.target as HTMLInputElement;
      const val = parseFloat(target.value) || 0;
      handleFieldChange("hours", val);
    },
    [handleFieldChange]
  );

  const handleStartTimeChange = useCallback(
    (event: CustomEvent<InputEvent>) => {
      const target = event.target as HTMLInputElement;
      handleFieldChange("startTime", target.value || "");
    },
    [handleFieldChange]
  );

  const handleEndTimeChange = useCallback(
    (event: CustomEvent<InputEvent>) => {
      const target = event.target as HTMLInputElement;
      handleFieldChange("endTime", target.value || "");
    },
    [handleFieldChange]
  );

  if (!isEditing) {
    return (
      <div className="bg-card border-default rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <i className="modus-icons text-base text-primary">wrench</i>
            <div className="text-base font-semibold text-foreground">
              {activity.activity}
            </div>
          </div>
          <div className="text-lg font-bold text-success">
            {activity.hours.toFixed(1)}h
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ReadOnlyField
            label="Labor Type"
            value={activity.laborType}
            icon="person"
          />
          {activity.laborCode && (
            <ReadOnlyField label="Labor Code" value={activity.laborCode} />
          )}
          <ReadOnlyField
            label="Start Time"
            value={activity.startTime}
            icon="clock"
          />
          <ReadOnlyField
            label="End Time"
            value={activity.endTime}
            icon="clock"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-default rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <i className="modus-icons text-base text-primary">file_edit</i>
          <div className="text-sm font-semibold text-foreground">
            Activity {index + 1}
          </div>
        </div>
        <ModusButton
          color="danger"
          variant="borderless"
          icon="delete"
          iconPosition="only"
          size="sm"
          ariaLabel="Delete activity"
          onButtonClick={() => onDelete(index)}
        />
      </div>

      <div className="flex flex-col gap-4">
        <DropdownField
          label="Activity"
          value={activity.activity}
          options={AVAILABLE_ACTIVITIES}
          onChange={(val) => handleFieldChange("activity", val)}
        />

        <DropdownField
          label="Labor Type"
          value={activity.laborType}
          options={AVAILABLE_LABOR_TYPES}
          onChange={(val) => handleFieldChange("laborType", val)}
        />

        <div className="grid grid-cols-3 gap-3">
          <ModusTextInput
            label="Start Time"
            value={activity.startTime}
            type="time"
            onInputChange={handleStartTimeChange}
          />
          <ModusTextInput
            label="End Time"
            value={activity.endTime}
            type="time"
            onInputChange={handleEndTimeChange}
          />
          <ModusTextInput
            label="Hours"
            value={activity.hours.toString()}
            type="number"
            onInputChange={handleHoursChange}
          />
        </div>
      </div>
    </div>
  );
}

export default function TimecardDetailPage() {
  const { employeeId, dayIndex } = useParams<{
    employeeId: string;
    dayIndex: string;
  }>();
  const navigate = useNavigate();
  usePageTitle("Timecard Detail");

  const employee = employeeId ? getEmployeeById(employeeId) : undefined;
  const dayIdx = dayIndex ? parseInt(dayIndex, 10) : -1;
  const originalDay = getTimesheetByIndex(dayIdx);

  const buildJobEntries = useCallback((): JobEntry[] => {
    if (!originalDay) return [];
    return [{
      job: originalDay.job,
      activities: originalDay.activities.map((a) => ({ ...a })),
    }];
  }, [originalDay]);

  const [isEditing, setIsEditing] = useState(false);
  const [editJobEntries, setEditJobEntries] = useState<JobEntry[]>(buildJobEntries);

  const handleBackClick = useCallback(() => {
    navigate(`/payroll/employees/${employeeId}/timecard`);
  }, [navigate, employeeId]);

  const handleEdit = useCallback(() => {
    setEditJobEntries(buildJobEntries());
    setIsEditing(true);
  }, [buildJobEntries]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditJobEntries(buildJobEntries());
  }, [buildJobEntries]);

  const handleSave = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleJobChange = useCallback((jobIndex: number, newJob: string) => {
    setEditJobEntries((prev) => {
      const next = [...prev];
      next[jobIndex] = { ...next[jobIndex], job: newJob };
      return next;
    });
  }, []);

  const handleActivityUpdate = useCallback(
    (jobIndex: number, actIndex: number, updated: TimesheetActivity) => {
      setEditJobEntries((prev) => {
        const next = [...prev];
        const activities = [...next[jobIndex].activities];
        activities[actIndex] = updated;
        next[jobIndex] = { ...next[jobIndex], activities };
        return next;
      });
    },
    []
  );

  const handleActivityDelete = useCallback((jobIndex: number, actIndex: number) => {
    setEditJobEntries((prev) => {
      const next = [...prev];
      next[jobIndex] = {
        ...next[jobIndex],
        activities: next[jobIndex].activities.filter((_, i) => i !== actIndex),
      };
      return next;
    });
  }, []);

  const handleAddActivity = useCallback((jobIndex: number) => {
    setEditJobEntries((prev) => {
      const next = [...prev];
      next[jobIndex] = {
        ...next[jobIndex],
        activities: [
          ...next[jobIndex].activities,
          { activity: "", laborType: "", laborCode: "", startTime: "", endTime: "", hours: 0 },
        ],
      };
      return next;
    });
  }, []);

  const handleAddJob = useCallback(() => {
    setEditJobEntries((prev) => [
      ...prev,
      { job: "", activities: [{ activity: "", laborType: "", laborCode: "", startTime: "", endTime: "", hours: 0 }] },
    ]);
    if (!isEditing) setIsEditing(true);
  }, [isEditing]);

  const handleDeleteJob = useCallback((jobIndex: number) => {
    setEditJobEntries((prev) => prev.filter((_, i) => i !== jobIndex));
  }, []);

  if (!originalDay || dayIdx < 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <i className="modus-icons text-4xl text-muted-foreground mb-4">
            warning
          </i>
          <div className="text-lg font-semibold text-foreground mb-2">
            Timecard Not Found
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            The timecard you are looking for does not exist.
          </div>
          <ModusButton
            color="primary"
            variant="outlined"
            onButtonClick={handleBackClick}
          >
            Back to Timecard
          </ModusButton>
        </div>
      </div>
    );
  }

  const displayJobEntries: JobEntry[] = isEditing
    ? editJobEntries
    : [{ job: originalDay.job, activities: originalDay.activities }];

  const totalHours = isEditing
    ? editJobEntries.reduce((sum, je) => sum + je.activities.reduce((s, a) => s + a.hours, 0), 0)
    : originalDay.totalHours;

  const needsOvertimeReview = originalDay.totalHours > 8;
  const statusColor = needsOvertimeReview
    ? "text-warning"
    : originalDay.status === "warning"
      ? "text-destructive"
      : originalDay.status === "complete"
        ? "text-success"
        : "text-muted-foreground";
  const statusIcon = needsOvertimeReview
    ? "warning"
    : originalDay.status === "warning"
      ? "cancel_circle"
      : originalDay.status === "complete"
        ? "check_circle"
        : "remove_circle";
  const statusLabel = needsOvertimeReview
    ? "Overtime Review"
    : originalDay.status === "warning"
      ? "Needs Attention"
      : originalDay.status === "complete"
        ? "Complete"
        : "No Entry";

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
          <div className="text-2xl font-bold text-foreground">
            {originalDay.dayLabel} - {originalDay.date}
          </div>
        </div>

        {!isEditing ? (
          <ModusButton
            color="primary"
            variant="outlined"
            icon="file_edit"
            iconPosition="left"
            size="md"
            onButtonClick={handleEdit}
          >
            Edit
          </ModusButton>
        ) : (
          <div className="flex gap-2">
            <ModusButton
              color="secondary"
              variant="outlined"
              size="md"
              onButtonClick={handleCancel}
            >
              Cancel
            </ModusButton>
            <ModusButton
              color="primary"
              variant="filled"
              icon="check"
              iconPosition="left"
              size="md"
              onButtonClick={handleSave}
            >
              Save
            </ModusButton>
          </div>
        )}
      </div>

      {employee && (
        <div className="text-sm text-muted-foreground mb-5 ml-8">
          {employee.name} - {employee.role}
        </div>
      )}

      {/* Status & Summary Bar */}
      <div className="flex flex-wrap items-stretch gap-4 mb-6">
        <div className="flex-1 min-w-[160px] bg-card border-default rounded-lg px-5 py-4 flex items-center gap-3">
          <i className={`modus-icons text-2xl ${statusColor}`}>{statusIcon}</i>
          <div>
            <div className={`text-sm font-semibold ${statusColor}`}>
              {statusLabel}
            </div>
            <div className="text-xs text-muted-foreground">Status</div>
          </div>
        </div>

        <div className="flex-1 min-w-[120px] bg-card border-default rounded-lg px-5 py-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-primary">
            {totalHours.toFixed(1)}h
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total Hours</div>
        </div>

        <div className="flex-1 min-w-[120px] bg-card border-default rounded-lg px-5 py-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-foreground">
            {originalDay.regularHours.toFixed(1)}h
          </div>
          <div className="text-xs text-muted-foreground mt-1">Regular</div>
        </div>

        {originalDay.overtimeHours > 0 && (
          <div className="flex-1 min-w-[120px] bg-card border-default rounded-lg px-5 py-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-warning">
              {originalDay.overtimeHours.toFixed(1)}h
            </div>
            <div className="text-xs text-muted-foreground mt-1">Overtime</div>
          </div>
        )}
      </div>

      {/* Alert */}
      {originalDay.alert && !isEditing && (
        <div className="bg-destructive-20 border-destructive rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
          <i className="modus-icons text-base text-destructive">warning</i>
          <div className="text-sm text-destructive font-medium">
            {originalDay.alert}
          </div>
        </div>
      )}

      {/* Job Entries */}
      {displayJobEntries.map((entry, jobIndex) => (
        <div key={`job-${jobIndex}`} className="mb-6 border-default rounded-lg p-5 bg-card">
          {/* Job Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="modus-icons text-lg text-primary">building_corporate</i>
              <div className="text-lg font-semibold text-foreground">
                {isEditing ? `Job ${jobIndex + 1}` : "Job"}
              </div>
            </div>
            {isEditing && displayJobEntries.length > 1 && (
              <ModusButton
                color="danger"
                variant="borderless"
                icon="delete"
                iconPosition="only"
                size="sm"
                ariaLabel="Remove job"
                onButtonClick={() => handleDeleteJob(jobIndex)}
              />
            )}
          </div>

          {isEditing ? (
            <div className="mb-4">
              <DropdownField
                label="Assigned Job"
                value={entry.job}
                options={AVAILABLE_JOBS}
                onChange={(val) => handleJobChange(jobIndex, val)}
              />
            </div>
          ) : (
            <div className="bg-background border-default rounded-md px-4 py-3 mb-4">
              <div className="text-base font-medium text-foreground">
                {entry.job || "No job assigned"}
              </div>
            </div>
          )}

          {/* Activities for this job */}
          <div className="flex items-center gap-2 mb-3">
            <i className="modus-icons text-base text-primary">wrench</i>
            <div className="text-sm font-semibold text-foreground">
              Activities ({entry.activities.length})
            </div>
          </div>

          {entry.activities.length === 0 && !isEditing ? (
            <div className="bg-background border-default rounded-md p-6 text-center">
              <i className="modus-icons text-2xl text-muted-foreground mb-2">
                calendar
              </i>
              <div className="text-sm text-muted-foreground">
                No activities recorded for this job.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {entry.activities.map((activity, actIdx) => (
                <ActivityCard
                  key={`job-${jobIndex}-activity-${actIdx}`}
                  activity={activity}
                  index={actIdx}
                  isEditing={isEditing}
                  onUpdate={(idx, updated) => handleActivityUpdate(jobIndex, idx, updated)}
                  onDelete={(idx) => handleActivityDelete(jobIndex, idx)}
                />
              ))}
            </div>
          )}

          {isEditing && (
            <div className="mt-3">
              <ModusButton
                color="primary"
                variant="outlined"
                icon="add"
                iconPosition="left"
                size="sm"
                onButtonClick={() => handleAddActivity(jobIndex)}
              >
                Add Activity
              </ModusButton>
            </div>
          )}
        </div>
      ))}

      {/* Add Job Button */}
      {isEditing && (
        <div className="mb-6">
          <ModusButton
            color="primary"
            variant="outlined"
            icon="add"
            iconPosition="left"
            size="md"
            onButtonClick={handleAddJob}
          >
            Add Job
          </ModusButton>
        </div>
      )}
    </div>
  );
}
