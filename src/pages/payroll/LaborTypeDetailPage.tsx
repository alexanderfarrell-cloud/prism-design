import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import ModusButton from "../../components/ModusButton";
import ModusTextInput from "../../components/ModusTextInput";
import {
  getCategoryById,
  getLaborTypeById,
  formatCurrency,
  getBurdenedRate,
  AVAILABLE_RISK_CODES,
} from "../../data/laborTypes";
import type { RiskCode } from "../../data/laborTypes";

export default function LaborTypeDetailPage() {
  const { categoryId, laborTypeId } = useParams<{
    categoryId: string;
    laborTypeId: string;
  }>();
  const navigate = useNavigate();

  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const laborType =
    categoryId && laborTypeId
      ? getLaborTypeById(categoryId, laborTypeId)
      : undefined;

  usePageTitle(
    laborType ? `Labor Classes - ${laborType.name}` : "Labor Classes"
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editPayRate, setEditPayRate] = useState(
    laborType?.payRate.toString() || ""
  );
  const [editBurdenPercent, setEditBurdenPercent] = useState(
    laborType?.burdenPercent.toString() || ""
  );
  const [editBillRate, setEditBillRate] = useState(
    laborType?.billRate.toString() || ""
  );
  const [editOtMultiplier, setEditOtMultiplier] = useState(
    (laborType?.otMultiplier ?? category?.otMultiplier ?? 1.5).toString()
  );
  const [editDtMultiplier, setEditDtMultiplier] = useState(
    (laborType?.dtMultiplier ?? category?.dtMultiplier ?? 2.0).toString()
  );
  const [editTaxClass, setEditTaxClass] = useState(
    laborType?.taxClassification ?? category?.taxClassification ?? "W-2 Employee"
  );
  const [editRiskCode, setEditRiskCode] = useState<RiskCode | null>(
    laborType?.riskCode ?? null
  );
  const [riskDropdownOpen, setRiskDropdownOpen] = useState(false);

  const handleBackClick = useCallback(() => {
    navigate(`/payroll/labor-classes/${categoryId}`);
  }, [navigate, categoryId]);

  const handleEdit = useCallback(() => {
    if (laborType) {
      setEditPayRate(laborType.payRate.toString());
      setEditBurdenPercent(laborType.burdenPercent.toString());
      setEditBillRate(laborType.billRate.toString());
      setEditOtMultiplier(
        (laborType.otMultiplier ?? category?.otMultiplier ?? 1.5).toString()
      );
      setEditDtMultiplier(
        (laborType.dtMultiplier ?? category?.dtMultiplier ?? 2.0).toString()
      );
      setEditTaxClass(
        laborType.taxClassification ??
          category?.taxClassification ??
          "W-2 Employee"
      );
      setEditRiskCode(laborType.riskCode ?? null);
    }
    setIsEditing(true);
  }, [laborType, category]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (!category || !laborType) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <i className="modus-icons text-4xl text-muted-foreground mb-4">
            warning
          </i>
          <div className="text-lg font-semibold text-foreground mb-2">
            Labor Type Not Found
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            The labor type you are looking for does not exist.
          </div>
          <ModusButton
            color="primary"
            variant="outlined"
            onButtonClick={() => navigate("/payroll/labor-classes")}
          >
            Back to Labor Classes
          </ModusButton>
        </div>
      </div>
    );
  }

  const effectiveOt = laborType.otMultiplier ?? category.otMultiplier;
  const effectiveDt = laborType.dtMultiplier ?? category.dtMultiplier;
  const effectiveTax =
    laborType.taxClassification ?? category.taxClassification;
  const burdened = getBurdenedRate(laborType);

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
            {laborType.name}
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

      <div className="text-sm text-muted-foreground mb-2 ml-8">
        {laborType.description}
      </div>
      <div className="text-xs text-muted-foreground mb-6 ml-8">
        State: {category.name}
      </div>

      {/* Rate Summary (read-only) */}
      {!isEditing && (
        <div className="flex flex-wrap items-stretch gap-4 mb-6">
          <div className="flex-1 min-w-[140px] bg-card border-default rounded-lg px-5 py-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(laborType.payRate)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Pay Rate / hr
            </div>
          </div>
          <div className="flex-1 min-w-[140px] bg-card border-default rounded-lg px-5 py-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(burdened)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Burdened / hr ({laborType.burdenPercent}%)
            </div>
          </div>
          <div className="flex-1 min-w-[140px] bg-card border-default rounded-lg px-5 py-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(laborType.billRate)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Bill Rate / hr
            </div>
          </div>
        </div>
      )}

      {/* Pay Rates */}
      <div className="border-default rounded-lg bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <i className="modus-icons text-base text-primary">monetarization</i>
          <div className="text-lg font-semibold text-foreground">
            Pay Rates
          </div>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-3 gap-4">
            <ModusTextInput
              label="Pay Rate ($/hr)"
              value={editPayRate}
              type="number"
              onInputChange={(e: CustomEvent<InputEvent>) => {
                const target = e.target as HTMLInputElement;
                setEditPayRate(target.value || "");
              }}
            />
            <ModusTextInput
              label="Burden %"
              value={editBurdenPercent}
              type="number"
              onInputChange={(e: CustomEvent<InputEvent>) => {
                const target = e.target as HTMLInputElement;
                setEditBurdenPercent(target.value || "");
              }}
            />
            <ModusTextInput
              label="Bill Rate ($/hr)"
              value={editBillRate}
              type="number"
              onInputChange={(e: CustomEvent<InputEvent>) => {
                const target = e.target as HTMLInputElement;
                setEditBillRate(target.value || "");
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Pay Rate
              </div>
              <div className="text-sm font-medium text-foreground">
                {formatCurrency(laborType.payRate)}/hr
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Burdened Rate
              </div>
              <div className="text-sm font-medium text-foreground">
                {formatCurrency(burdened)}/hr ({laborType.burdenPercent}%)
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Bill Rate
              </div>
              <div className="text-sm font-medium text-foreground">
                {formatCurrency(laborType.billRate)}/hr
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overtime & Classification */}
      <div className="border-default rounded-lg bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <i className="modus-icons text-base text-primary">settings</i>
          <div className="text-lg font-semibold text-foreground">
            Overtime & Classification
          </div>
        </div>
        <div className="text-xs text-muted-foreground mb-4">
          Inherited from {category.name} state defaults. Override values below to customize for this labor type.
        </div>

        {isEditing ? (
          <div className="grid grid-cols-3 gap-4">
            <ModusTextInput
              label="OT Multiplier"
              value={editOtMultiplier}
              type="number"
              onInputChange={(e: CustomEvent<InputEvent>) => {
                const target = e.target as HTMLInputElement;
                setEditOtMultiplier(target.value || "");
              }}
            />
            <ModusTextInput
              label="DT Multiplier"
              value={editDtMultiplier}
              type="number"
              onInputChange={(e: CustomEvent<InputEvent>) => {
                const target = e.target as HTMLInputElement;
                setEditDtMultiplier(target.value || "");
              }}
            />
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Tax Classification
              </div>
              <div className="border-default rounded-md bg-background px-3 py-2 text-sm text-foreground">
                {editTaxClass}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                OT Multiplier
              </div>
              <div className="text-sm font-medium text-foreground">
                {effectiveOt}x
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                DT Multiplier
              </div>
              <div className="text-sm font-medium text-foreground">
                {effectiveDt}x
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Tax Classification
              </div>
              <div className="text-sm font-medium text-foreground">
                {effectiveTax}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Risk Code / Workers' Comp */}
      <div className="border-default rounded-lg bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <i className="modus-icons text-base text-primary">shield</i>
          <div className="text-lg font-semibold text-foreground">
            Risk Code
          </div>
        </div>
        <div className="text-xs text-muted-foreground mb-4">
          Workers' compensation classification code for this labor type.
        </div>

        {isEditing ? (
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Workers' Comp Code
            </div>
            <div className="relative">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setRiskDropdownOpen((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setRiskDropdownOpen((prev) => !prev);
                  }
                }}
                className="flex items-center justify-between px-3 py-2 border-default rounded-md bg-background cursor-pointer hover:bg-muted transition-colors"
              >
                <div className="text-sm text-foreground">
                  {editRiskCode
                    ? `${editRiskCode.code} - ${editRiskCode.description}`
                    : "Select a risk code..."}
                </div>
                <i
                  className={`modus-icons text-xs text-muted-foreground transition-transform ${riskDropdownOpen ? "rotate-180" : ""}`}
                >
                  expand_more
                </i>
              </div>
              {riskDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border-default rounded-md elevation-2 z-50 max-h-64 overflow-auto">
                  {AVAILABLE_RISK_CODES.map((rc) => (
                    <div
                      key={rc.code}
                      role="option"
                      aria-selected={editRiskCode?.code === rc.code}
                      tabIndex={0}
                      onClick={() => {
                        setEditRiskCode(rc);
                        setRiskDropdownOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setEditRiskCode(rc);
                          setRiskDropdownOpen(false);
                        }
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors ${
                        editRiskCode?.code === rc.code
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {rc.code} - {rc.description}
                      </div>
                      <div className={`text-xs ${editRiskCode?.code === rc.code ? "text-primary-foreground" : "text-muted-foreground"}`}>
                        ${rc.rate.toFixed(2)} per $100 payroll
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {editRiskCode && (
              <div className="grid grid-cols-3 gap-4 mt-4 px-1">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">WC Code</div>
                  <div className="text-sm font-medium text-foreground">{editRiskCode.code}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Description</div>
                  <div className="text-sm font-medium text-foreground">{editRiskCode.description}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Rate (per $100 payroll)</div>
                  <div className="text-sm font-medium text-foreground">${editRiskCode.rate.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>
        ) : laborType.riskCode ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                WC Code
              </div>
              <div className="text-sm font-medium text-foreground">
                {laborType.riskCode.code}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Description
              </div>
              <div className="text-sm font-medium text-foreground">
                {laborType.riskCode.description}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Rate (per $100 payroll)
              </div>
              <div className="text-sm font-medium text-foreground">
                ${laborType.riskCode.rate.toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No workers' comp code assigned. Click Edit to add one.
          </div>
        )}
      </div>

      {/* Margin Analysis */}
      {!isEditing && (
        <div className="border-default rounded-lg bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="modus-icons text-base text-primary">bar_graph_line</i>
            <div className="text-lg font-semibold text-foreground">
              Margin Analysis
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Gross Margin
              </div>
              <div className="text-sm font-medium text-success">
                {formatCurrency(laborType.billRate - laborType.payRate)}/hr
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Net Margin (after burden)
              </div>
              <div className="text-sm font-medium text-foreground">
                {formatCurrency(laborType.billRate - burdened)}/hr
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Margin %
              </div>
              <div className="text-sm font-medium text-foreground">
                {((1 - burdened / laborType.billRate) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
