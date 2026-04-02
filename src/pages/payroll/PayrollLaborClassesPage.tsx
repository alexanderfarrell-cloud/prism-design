import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import ModusButton from "../../components/ModusButton";
import ModusTextInput from "../../components/ModusTextInput";
import { LABOR_CATEGORIES } from "../../data/laborTypes";
import type { LaborCategory } from "../../data/laborTypes";

function CategoryCard({
  category,
  onClick,
}: {
  category: LaborCategory;
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
      className="border-l-4 border-l-primary border-default rounded-lg bg-card px-5 py-4 cursor-pointer hover:bg-muted transition-colors flex items-center justify-between"
    >
      <div>
        <div className="text-lg font-semibold text-foreground mb-2">
          {category.name} Rates
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div>{category.laborTypes.length} labor type{category.laborTypes.length !== 1 ? "s" : ""}</div>
          <div>OT {category.otMultiplier}x</div>
          <div>DT {category.dtMultiplier}x</div>
          <div>{category.taxClassification}</div>
        </div>
      </div>
      <i className="modus-icons text-xl text-muted-foreground flex-shrink-0 ml-4">
        chevron_right
      </i>
    </div>
  );
}

export default function PayrollLaborClassesPage() {
  usePageTitle("Payroll - Labor Classes");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = LABOR_CATEGORIES.filter((cat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(query) ||
      cat.laborTypes.some((lt) => lt.name.toLowerCase().includes(query))
    );
  });

  const handleSearchChange = useCallback((event: CustomEvent<InputEvent>) => {
    const target = event.target as HTMLInputElement;
    setSearchQuery(target.value || "");
  }, []);

  const handleBackClick = useCallback(() => {
    navigate("/payroll");
  }, [navigate]);

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      navigate(`/payroll/labor-classes/${categoryId}`);
    },
    [navigate]
  );

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
          <div className="text-2xl font-bold text-foreground">
            Labor Classes
          </div>
        </div>
        <ModusButton
          color="primary"
          variant="filled"
          icon="add"
          iconPosition="left"
          size="md"
        >
          Add Labor Class
        </ModusButton>
      </div>

      <div className="text-sm text-muted-foreground mb-6 ml-8">
        Labor classes organized by state -- manage rates, risk codes, and classifications per jurisdiction.
      </div>

      <ModusTextInput
        placeholder="Search labor classes..."
        includeSearch
        value={searchQuery}
        onInputChange={handleSearchChange}
        aria-label="Search labor classes"
      />

      <div className="flex flex-col gap-3 mt-4">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={() => handleCategoryClick(category.id)}
          />
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No labor classes match your search.
          </div>
        )}
      </div>
    </div>
  );
}
