import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePageTitle from "../../../../hooks/usePageTitle";
import ModusTextInput from "../../../../components/ModusTextInput";
import ModusButton from "../../../../components/ModusButton";
import { getEmployeeById } from "../../../../data/employees";
import type { PersonalInfo } from "../../../../data/employees";

function SectionHeader({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-2">
      <i className="modus-icons text-lg text-primary">{icon}</i>
      <div className="text-base font-semibold text-foreground">{label}</div>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-sm text-foreground">
        {value || "--"}
      </div>
    </div>
  );
}

export default function PersonalInfoPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const employee = getEmployeeById(employeeId || "");

  usePageTitle(
    employee
      ? `${employee.name} - Personal Information`
      : "Personal Information"
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PersonalInfo>(
    employee?.personalInfo || {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      preferredName: "",
      ssn: "",
      dateOfBirth: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      personalEmail: "",
      workEmail: "",
      mobilePhone: "",
      homePhone: "",
      workPhone: "",
    }
  );

  const handleBackClick = useCallback(() => {
    navigate(`/payroll/employees/${employeeId}`);
  }, [navigate, employeeId]);

  const handleFieldChange = useCallback(
    (field: keyof PersonalInfo) => (event: CustomEvent<InputEvent>) => {
      const target = event.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [field]: target.value || "" }));
    },
    []
  );

  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      setFormData(
        employee?.personalInfo || formData
      );
    }
    setIsEditing((prev) => !prev);
  }, [isEditing, employee?.personalInfo, formData]);

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
            Personal Information
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
      <div className="flex items-center justify-between mb-1">
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
            Personal Information
          </div>
        </div>
        <ModusButton
          color={isEditing ? "secondary" : "primary"}
          variant="outlined"
          icon={isEditing ? "close" : "pencil"}
          iconPosition="left"
          size="sm"
          onButtonClick={handleEditToggle}
        >
          {isEditing ? "Cancel" : "Edit"}
        </ModusButton>
      </div>
      <div className="text-sm text-muted-foreground mb-6 ml-8">
        {employee.name} - {employee.role}
      </div>

      {/* Name Section */}
      <div className="bg-background border-default rounded-lg p-6 mb-4">
        <SectionHeader icon="person" label="Name" />
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <ModusTextInput
              label="First Name"
              value={formData.firstName}
              onInputChange={handleFieldChange("firstName")}
              required
            />
            <ModusTextInput
              label="Middle Name"
              value={formData.middleName}
              onInputChange={handleFieldChange("middleName")}
            />
            <ModusTextInput
              label="Last Name"
              value={formData.lastName}
              onInputChange={handleFieldChange("lastName")}
              required
            />
            <ModusTextInput
              label="Suffix"
              value={formData.suffix}
              placeholder="Jr., Sr., III, etc."
              onInputChange={handleFieldChange("suffix")}
            />
            <ModusTextInput
              label="Preferred Name"
              value={formData.preferredName}
              onInputChange={handleFieldChange("preferredName")}
            />
            <ModusTextInput
              label="SSN"
              value={formData.ssn}
              onInputChange={handleFieldChange("ssn")}
            />
            <ModusTextInput
              label="Date of Birth"
              value={formData.dateOfBirth}
              type="date"
              onInputChange={handleFieldChange("dateOfBirth")}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ReadOnlyField label="First Name" value={formData.firstName} />
            <ReadOnlyField label="Middle Name" value={formData.middleName} />
            <ReadOnlyField label="Last Name" value={formData.lastName} />
            <ReadOnlyField label="Suffix" value={formData.suffix} />
            <ReadOnlyField label="Preferred Name" value={formData.preferredName} />
            <ReadOnlyField label="SSN" value={formData.ssn} />
            <ReadOnlyField label="Date of Birth" value={formData.dateOfBirth} />
          </div>
        )}
      </div>

      {/* Address Section */}
      <div className="bg-background border-default rounded-lg p-6 mb-4">
        <SectionHeader icon="location" label="Address" />
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <ModusTextInput
              label="Address Line 1"
              value={formData.address1}
              onInputChange={handleFieldChange("address1")}
              required
            />
            <ModusTextInput
              label="Address Line 2"
              value={formData.address2}
              placeholder="Apt, Suite, Unit, etc."
              onInputChange={handleFieldChange("address2")}
            />
            <ModusTextInput
              label="City"
              value={formData.city}
              onInputChange={handleFieldChange("city")}
              required
            />
            <ModusTextInput
              label="State"
              value={formData.state}
              onInputChange={handleFieldChange("state")}
              required
            />
            <ModusTextInput
              label="ZIP Code"
              value={formData.zipCode}
              onInputChange={handleFieldChange("zipCode")}
              required
            />
            <ModusTextInput
              label="Country"
              value={formData.country}
              onInputChange={handleFieldChange("country")}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ReadOnlyField label="Address Line 1" value={formData.address1} />
            <ReadOnlyField label="Address Line 2" value={formData.address2} />
            <ReadOnlyField label="City" value={formData.city} />
            <ReadOnlyField label="State" value={formData.state} />
            <ReadOnlyField label="ZIP Code" value={formData.zipCode} />
            <ReadOnlyField label="Country" value={formData.country} />
          </div>
        )}
      </div>

      {/* Contact Information Section */}
      <div className="bg-background border-default rounded-lg p-6 mb-4">
        <SectionHeader icon="phone" label="Contact Information" />
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <ModusTextInput
              label="Personal Email"
              value={formData.personalEmail}
              type="email"
              onInputChange={handleFieldChange("personalEmail")}
            />
            <ModusTextInput
              label="Work Email"
              value={formData.workEmail}
              type="email"
              onInputChange={handleFieldChange("workEmail")}
            />
            <ModusTextInput
              label="Mobile Phone"
              value={formData.mobilePhone}
              type="tel"
              onInputChange={handleFieldChange("mobilePhone")}
              required
            />
            <ModusTextInput
              label="Home Phone"
              value={formData.homePhone}
              type="tel"
              onInputChange={handleFieldChange("homePhone")}
            />
            <ModusTextInput
              label="Work Phone"
              value={formData.workPhone}
              type="tel"
              onInputChange={handleFieldChange("workPhone")}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ReadOnlyField label="Personal Email" value={formData.personalEmail} />
            <ReadOnlyField label="Work Email" value={formData.workEmail} />
            <ReadOnlyField label="Mobile Phone" value={formData.mobilePhone} />
            <ReadOnlyField label="Home Phone" value={formData.homePhone} />
            <ReadOnlyField label="Work Phone" value={formData.workPhone} />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end gap-3 mt-2 mb-6">
          <ModusButton
            color="secondary"
            variant="outlined"
            size="md"
            onButtonClick={handleEditToggle}
          >
            Cancel
          </ModusButton>
          <ModusButton
            color="primary"
            variant="filled"
            icon="save_disk"
            iconPosition="left"
            size="md"
            onButtonClick={() => setIsEditing(false)}
          >
            Save Changes
          </ModusButton>
        </div>
      )}
    </div>
  );
}
