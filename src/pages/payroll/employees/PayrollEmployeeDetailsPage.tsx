import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePageTitle from "../../../hooks/usePageTitle";
import ModusAvatar from "../../../components/ModusAvatar";
import ModusSwitch from "../../../components/ModusSwitch";
import { getEmployeeById } from "../../../data/employees";
import { getDefaultLaborType } from "../../../data/laborTypes";
import { DETAIL_SECTIONS } from "../../../data/detailSections";
import type { DetailSection } from "../../../data/detailSections";

function SectionRow({
  section,
  onClick,
}: {
  section: DetailSection;
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
      className="flex items-center gap-4 px-4 py-4 bg-card border-default rounded-lg cursor-pointer hover:bg-muted transition-colors"
    >
      <i className="modus-icons text-xl text-foreground">{section.icon}</i>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="text-sm font-medium text-foreground">
          {section.label}
        </div>
        {section.hasWarning && (
          <i className="modus-icons text-sm text-warning">warning</i>
        )}
      </div>

      {section.description && (
        <div className="text-xs text-muted-foreground hidden sm:block">
          {section.description}
        </div>
      )}

      <i className="modus-icons text-lg text-muted-foreground">
        chevron_right
      </i>
    </div>
  );
}

export default function PayrollEmployeeDetailsPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const employee = getEmployeeById(employeeId || "");

  usePageTitle(
    employee ? `Employee - ${employee.name}` : "Employee Details"
  );

  const [isActive, setIsActive] = useState(employee?.status === "Active");
  const [selectedJob, setSelectedJob] = useState(employee?.defaultJob || "");
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const jobDropdownRef = useRef<HTMLDivElement>(null);

  const defaultLaborType = employee
    ? getDefaultLaborType(employee.laborTypes)
    : undefined;

  const jobOptions = employee
    ? employee.projects.map((p) => p.name)
    : [];

  const handleBackClick = useCallback(() => {
    navigate("/payroll/employees");
  }, [navigate]);

  const handleStatusToggle = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const handleJobSelect = useCallback((job: string) => {
    setSelectedJob(job);
    setJobDropdownOpen(false);
  }, []);

  useEffect(() => {
    if (!jobDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        jobDropdownRef.current &&
        !jobDropdownRef.current.contains(e.target as Node)
      ) {
        setJobDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [jobDropdownOpen]);

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
          <div className="text-2xl font-bold text-foreground">
            Employee Details
          </div>
        </div>
        <div className="bg-card border-default rounded-lg p-6 text-center">
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
        <div className="text-2xl font-bold text-foreground">
          Employee Details
        </div>
      </div>
      <div className="text-sm text-primary mb-6 ml-8">
        View and edit employee information
      </div>

      <div className="bg-card border-default rounded-lg px-5 py-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <ModusAvatar
              alt={employee.name}
              imgSrc={employee.avatarUrl}
              initials={employee.initials}
              shape="circle"
              size="lg"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">
              {employee.employeeNumber}
            </div>
            <div className="text-base font-bold text-foreground tracking-wide uppercase">
              {employee.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {defaultLaborType ? defaultLaborType.name : employee.role}
            </div>
            <div className="flex items-center gap-1 mt-1 cursor-pointer text-primary text-xs">
              <i className="modus-icons text-xs">pencil</i>
              <div>Edit Photo</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <ModusSwitch
              value={isActive}
              onInputChange={handleStatusToggle}
              aria-label="Toggle employee active status"
            />
            <div
              className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
            >
              {isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-3 border-top-default">
          <div className="text-xs font-medium text-muted-foreground">
            Default Job
          </div>
          <div className="relative" ref={jobDropdownRef}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setJobDropdownOpen((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setJobDropdownOpen((prev) => !prev);
                }
              }}
              className="flex items-center gap-1 px-3 py-1 border-default rounded bg-background text-sm text-foreground cursor-pointer hover:bg-muted transition-colors"
            >
              <div>{selectedJob || "Select a job"}</div>
              <i
                className={`modus-icons text-xs text-muted-foreground transition-transform ${jobDropdownOpen ? "rotate-180" : ""}`}
              >
                expand_more
              </i>
            </div>
            {jobDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-background border-default rounded-lg elevation-2 z-50 overflow-hidden">
                {jobOptions.length > 0 ? (
                  jobOptions.map((job) => (
                    <div
                      key={job}
                      role="option"
                      aria-selected={job === selectedJob}
                      tabIndex={0}
                      onClick={() => handleJobSelect(job)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleJobSelect(job);
                        }
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                        job === selectedJob
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {job}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    No jobs assigned
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {DETAIL_SECTIONS.map((section) => (
          <SectionRow
            key={section.id}
            section={section}
            onClick={() =>
              navigate(
                `/payroll/employees/${employeeId}/${section.id}`
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
