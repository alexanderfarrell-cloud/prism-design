import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePageTitle from "../../../../hooks/usePageTitle";
import ModusButton from "../../../../components/ModusButton";
import { getEmployeeById } from "../../../../data/employees";
import { LABOR_TYPES } from "../../../../data/laborTypes";

interface LaborTypeEntry {
  id: number;
  selectedOptionId: string;
  isDefault: boolean;
}

function LaborTypeDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (optionId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel =
    LABOR_TYPES.find((o) => o.id === value)?.label || "";

  return (
    <div className="relative">
      <div className="text-xs font-medium text-muted-foreground mb-1">
        Labor type
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
        className="flex items-center justify-between w-auto min-w-[180px] px-3 py-2 border-2 border-warning rounded-md bg-background cursor-pointer hover:bg-muted transition-colors"
      >
        <div
          className={`text-sm ${selectedLabel ? "text-foreground" : "text-muted-foreground"}`}
        >
          {selectedLabel || "Select labor type"}
        </div>
        <i
          className={`modus-icons text-xs text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          expand_more
        </i>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border-default rounded-md elevation-2 z-50 max-h-48 overflow-auto">
          {LABOR_TYPES.map((opt) => (
            <div
              key={opt.id}
              role="option"
              aria-selected={opt.id === value}
              tabIndex={0}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(opt.id);
                  setIsOpen(false);
                }
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                opt.id === value
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LaborTypeCard({
  entry,
  index,
  onDelete,
  onChange,
  onToggleDefault,
}: {
  entry: LaborTypeEntry;
  index: number;
  onDelete: () => void;
  onChange: (optionId: string) => void;
  onToggleDefault: () => void;
}) {
  const selectedOption = LABOR_TYPES.find(
    (o) => o.id === entry.selectedOptionId
  );

  return (
    <div className="bg-background border-default rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-foreground">
          Labor type {index + 1}
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={onDelete}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onDelete();
            }
          }}
          className="cursor-pointer text-foreground hover:text-destructive transition-colors"
        >
          <i className="modus-icons text-lg">delete</i>
        </div>
      </div>

      <div className="mb-3">
        <LaborTypeDropdown
          value={entry.selectedOptionId}
          onChange={onChange}
        />
      </div>

      {selectedOption && (
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between bg-muted px-4 py-3 rounded-t">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <i className="modus-icons text-xl text-primary">monetarization</i>
              <div>Rate</div>
            </div>
            <div className="text-sm font-medium text-foreground">
              {selectedOption.rate}
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={onToggleDefault}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggleDefault();
              }
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-b cursor-pointer transition-colors ${
              entry.isDefault
                ? "bg-muted"
                : "bg-muted hover:bg-muted"
            }`}
          >
            <i
              className={`modus-icons text-xl ${
                entry.isDefault ? "text-success" : "text-muted-foreground"
              }`}
            >
              {entry.isDefault ? "check_circle" : "circle_outline"}
            </i>
            <div className="text-sm text-foreground">Default labor type</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LaborTypePage() {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const employee = getEmployeeById(employeeId || "");

  usePageTitle(
    employee ? `${employee.name} - Labor Type` : "Labor Type"
  );

  const initialEntries: LaborTypeEntry[] = employee
    ? employee.laborTypes.map((lt, index) => ({
        id: index + 1,
        selectedOptionId: lt.laborTypeId,
        isDefault: lt.isDefault,
      }))
    : [{ id: 1, selectedOptionId: "", isDefault: true }];

  const [entries, setEntries] = useState<LaborTypeEntry[]>(initialEntries);
  const [nextId, setNextId] = useState(initialEntries.length + 1);

  const handleBackClick = useCallback(() => {
    navigate(`/payroll/employees/${employeeId}`);
  }, [navigate, employeeId]);

  const handleAddLaborType = useCallback(() => {
    setEntries((prev) => [
      ...prev,
      { id: nextId, selectedOptionId: "", isDefault: false },
    ]);
    setNextId((prev) => prev + 1);
  }, [nextId]);

  const handleDelete = useCallback((entryId: number) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== entryId);
      if (updated.length > 0 && !updated.some((e) => e.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  }, []);

  const handleChange = useCallback((entryId: number, optionId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, selectedOptionId: optionId } : e
      )
    );
  }, []);

  const handleToggleDefault = useCallback((entryId: number) => {
    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        isDefault: e.id === entryId,
      }))
    );
  }, []);

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
          <div className="text-2xl font-bold text-foreground">Labor Type</div>
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
        <div className="text-2xl font-bold text-foreground">Labor Type</div>
      </div>
      <div className="text-sm text-muted-foreground mb-6 ml-8">
        {employee.name} - {employee.role}
      </div>

      <div className="text-sm text-muted-foreground mb-5">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </div>

      <div className="flex flex-col gap-4 mb-5">
        {entries.map((entry, index) => (
          <LaborTypeCard
            key={entry.id}
            entry={entry}
            index={index}
            onDelete={() => handleDelete(entry.id)}
            onChange={(optionId) => handleChange(entry.id, optionId)}
            onToggleDefault={() => handleToggleDefault(entry.id)}
          />
        ))}
      </div>

      <div className="mb-8">
        <ModusButton
          color="primary"
          variant="outlined"
          icon="add"
          iconPosition="left"
          size="sm"
          onButtonClick={handleAddLaborType}
        >
          Add labor type
        </ModusButton>
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
