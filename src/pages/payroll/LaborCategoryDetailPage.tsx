import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import ModusButton from "../../components/ModusButton";
import ModusTextInput from "../../components/ModusTextInput";
import { getCategoryById, formatCurrency, getBurdenedRate } from "../../data/laborTypes";
import type { LaborType } from "../../data/laborTypes";

function LaborTypeCard({
  laborType,
  onClick,
}: {
  laborType: LaborType;
  onClick: () => void;
}) {
  const burdened = getBurdenedRate(laborType);

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
      className="border-l-4 border-l-primary border-default rounded-lg bg-card px-5 py-4 cursor-pointer hover:bg-muted transition-colors flex items-center justify-between"
    >
      <div>
        <div className="text-lg font-semibold text-foreground mb-2">
          {laborType.name}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <i className="modus-icons text-xs">monetarization</i>
            <div>Pay {formatCurrency(laborType.payRate)}/hr</div>
          </div>
          <div className="flex items-center gap-1">
            <i className="modus-icons text-xs">clipboard</i>
            <div>Burdened {formatCurrency(burdened)}/hr ({laborType.burdenPercent}%)</div>
          </div>
          <div className="flex items-center gap-1">
            <i className="modus-icons text-xs">earnings_statement</i>
            <div>Bill {formatCurrency(laborType.billRate)}/hr</div>
          </div>
        </div>
      </div>
      <i className="modus-icons text-xl text-muted-foreground flex-shrink-0 ml-4">
        chevron_right
      </i>
    </div>
  );
}

export default function LaborCategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const category = categoryId ? getCategoryById(categoryId) : undefined;

  usePageTitle(category ? `Labor Classes - ${category.name}` : "Labor Classes");

  const handleBackClick = useCallback(() => {
    navigate("/payroll/labor-classes");
  }, [navigate]);

  const [laborTypeSearch, setLaborTypeSearch] = useState("");

  const filteredLaborTypes = category
    ? category.laborTypes.filter((lt) => {
        if (!laborTypeSearch) return true;
        const query = laborTypeSearch.toLowerCase();
        return (
          lt.name.toLowerCase().includes(query) ||
          lt.riskCode?.code.includes(query) ||
          lt.riskCode?.description.toLowerCase().includes(query)
        );
      })
    : [];

  const handleLaborTypeSearchChange = useCallback(
    (event: CustomEvent<InputEvent>) => {
      const target = event.target as HTMLInputElement;
      setLaborTypeSearch(target.value || "");
    },
    []
  );

  const handleLaborTypeClick = useCallback(
    (laborTypeId: string) => {
      navigate(`/payroll/labor-classes/${categoryId}/${laborTypeId}`);
    },
    [navigate, categoryId]
  );

  if (!category) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <i className="modus-icons text-4xl text-muted-foreground mb-4">
            warning
          </i>
          <div className="text-lg font-semibold text-foreground mb-2">
            State Not Found
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            The state you are looking for does not exist.
          </div>
          <ModusButton
            color="primary"
            variant="outlined"
            onButtonClick={handleBackClick}
          >
            Back to Labor Classes
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
          <div className="text-2xl font-bold text-foreground">
            {category.name}
          </div>
        </div>
        <ModusButton
          color="primary"
          variant="filled"
          icon="add"
          iconPosition="left"
          size="md"
        >
          Add labor type
        </ModusButton>
      </div>

      <div className="text-sm text-muted-foreground mb-6 ml-8">
        State-specific labor rates, classifications, and risk codes.
      </div>

      {/* State Defaults */}
      <div className="border-default rounded-lg bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <i className="modus-icons text-base text-primary">settings</i>
          <div className="text-lg font-semibold text-foreground">
            State Defaults
          </div>
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          These defaults are inherited by all labor types in this state. Individual types can override them.
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs font-semibold text-foreground mb-1">
              OT Multiplier
            </div>
            <div className="border-default rounded-md bg-background px-3 py-2 text-sm text-foreground">
              {category.otMultiplier}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground mb-1">
              DT Multiplier
            </div>
            <div className="border-default rounded-md bg-background px-3 py-2 text-sm text-foreground">
              {category.dtMultiplier}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-foreground mb-1">
            Tax Classification
          </div>
          <div className="border-default rounded-md bg-background px-3 py-2 text-sm text-foreground inline-block">
            {category.taxClassification}
          </div>
        </div>
      </div>

      {/* Labor Types */}
      <div className="text-base font-semibold text-foreground mb-3">
        Labor Types ({category.laborTypes.length})
      </div>

      <ModusTextInput
        placeholder="Search labor types..."
        includeSearch
        value={laborTypeSearch}
        onInputChange={handleLaborTypeSearchChange}
        aria-label="Search labor types"
      />

      <div className="flex flex-col gap-3 mt-3">
        {filteredLaborTypes.map((lt) => (
          <LaborTypeCard
            key={lt.id}
            laborType={lt}
            onClick={() => handleLaborTypeClick(lt.id)}
          />
        ))}

        {filteredLaborTypes.length === 0 && category.laborTypes.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No labor types match your search.
          </div>
        )}

        {category.laborTypes.length === 0 && (
          <div className="border-default rounded-lg bg-card p-8 text-center">
            <i className="modus-icons text-3xl text-muted-foreground mb-2">
              person
            </i>
            <div className="text-sm text-muted-foreground">
              No labor types for this state yet.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
