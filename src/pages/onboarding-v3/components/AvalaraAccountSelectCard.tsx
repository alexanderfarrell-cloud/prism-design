import type { Company } from "../steps/AvalaraCompanySelectStep";

type AvalaraAccountSelectCardProps = {
  company: Pick<Company, "name" | "location" | "accountId">;
  /** Selected / confirmation styling (light blue, blue border, check). */
  selected: boolean;
  onSelect?: () => void;
  /** Renders inert on the review step (no button semantics). */
  asConfirmation?: boolean;
};

/**
 * Company row used on Avalara company select (selected state) and on the review
 * step to mirror the same “existing account” choice. Matches the light blue
 * selection treatment with a circular check.
 */
export default function AvalaraAccountSelectCard({
  company,
  selected,
  onSelect,
  asConfirmation = false,
}: AvalaraAccountSelectCardProps) {
  const { name, location, accountId } = company;
  const selectedClass =
    "border-[#0062A1] border-2 bg-[#D9EAF7] shadow-sm";
  const unselectedClass =
    "border-default border-2 bg-background hover:border-primary";

  const body = (
    <div
      className={`flex items-center justify-between gap-3 rounded-[10px] px-4 py-4 ${
        selected ? selectedClass : unselectedClass
      } transition-all`}
    >
      <div className="flex min-w-0 flex-col gap-0.5 text-left">
        <div className="text-sm font-bold text-foreground leading-snug">{name}</div>
        <div className="text-xs text-foreground-60">{location}</div>
        <div className="text-xs text-foreground-60">Account ID: {accountId}</div>
      </div>
      {selected ? (
        <div
          className="h-8 w-8 shrink-0 rounded-full bg-primary flex items-center justify-center"
          aria-hidden
        >
          <i className="modus-icons text-base leading-none text-white">check</i>
        </div>
      ) : null}
    </div>
  );

  if (asConfirmation || onSelect == null) {
    return (
      <div
        className="rounded-[10px]"
        role="region"
        aria-label={`Selected Avalara account ${name}`}
      >
        {body}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {body}
    </div>
  );
}
