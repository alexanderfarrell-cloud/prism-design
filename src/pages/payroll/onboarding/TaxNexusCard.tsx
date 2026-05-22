import ModusBadge from "../../../components/ModusBadge";
import ModusButton from "../../../components/ModusButton";
import ModusButtonGroup from "../../../components/ModusButtonGroup";

/** Avalara admin — nexus and company tax settings (opens outside simplified onboarding). */
export const AVALARA_NEXUS_ADMIN_URL =
  "https://admin.avalara.com/avatax/nexus";

export interface TaxNexusCardProps {
  jurisdictionName: string;
  jurisdictionCode: string;
  /** When false, hides Review/Edit in Avalara (e.g. empty shell). */
  showAvalaraActions?: boolean;
}

export function openAvalaraNexus() {
  window.open(AVALARA_NEXUS_ADMIN_URL, "_blank", "noopener,noreferrer");
}

/**
 * Card showing the nexus the user selected or confirmed in Avalara (jurisdiction, tax type, success state).
 */
export default function TaxNexusCard({
  jurisdictionName,
  jurisdictionCode,
  showAvalaraActions = true,
}: TaxNexusCardProps) {
  const stateName = jurisdictionName || "—";
  const stateCode = jurisdictionCode || "";

  return (
    <div
      className="rounded-xl border border-default bg-card elevation-1 overflow-hidden"
      role="region"
      aria-label="Tax nexus from Avalara"
    >
      <div
        className="flex items-start gap-4 p-5 border-bottom-default bg-success-20"
        role="status"
        aria-live="polite"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success-40 text-success"
          aria-hidden
        >
          <i className="modus-icons text-2xl">check_circle</i>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-lg font-semibold text-foreground">
              Active local nexus
            </div>
            <ModusBadge color="success" variant="filled" size="sm">
              Active
            </ModusBadge>
          </div>
          <div className="text-sm text-foreground-60">
            Avalara returned success for this nexus. Your jurisdiction is
            registered for Sales & Use Tax in this state.
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className="grid gap-1">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground-40">
            Jurisdiction (state)
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <div className="text-lg font-semibold text-foreground">
              {stateName}
            </div>
            {stateCode ? (
              <ModusBadge color="secondary" variant="outlined" size="sm">
                {stateCode}
              </ModusBadge>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground-40">
            Nexus details
          </div>
          <div className="flex flex-wrap gap-2">
            <ModusBadge color="primary" variant="outlined" size="md">
              Tax Type: Sales & Use Tax
            </ModusBadge>
          </div>
        </div>

        {showAvalaraActions ? (
          <div className="border-top-default pt-5">
            <div className="text-xs font-bold uppercase tracking-wide text-foreground-40 mb-2">
              Review or update in Avalara
            </div>
            <ModusButtonGroup
              variant="outlined"
              color="primary"
              ariaLabel="Review or update default nexus in Avalara"
            >
              <ModusButton
                icon="share"
                iconPosition="left"
                onButtonClick={openAvalaraNexus}
              >
                Review in Avalara
              </ModusButton>
              <ModusButton
                icon="file_edit"
                iconPosition="left"
                onButtonClick={openAvalaraNexus}
              >
                Edit in Avalara
              </ModusButton>
            </ModusButtonGroup>
            <div className="text-xs text-foreground-40 mt-2">
              Opens Avalara in a new tab so you can view or edit detailed nexus
              properties outside this simplified onboarding flow.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
