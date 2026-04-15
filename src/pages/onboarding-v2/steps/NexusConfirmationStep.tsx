import ModusBadge from "../../../components/ModusBadge";
import ModusButton from "../../../components/ModusButton";

const AVALARA_NEXUS_URL = "https://admin.avalara.com/avatax/nexus";

function openAvalaraNexus() {
  window.open(AVALARA_NEXUS_URL, "_blank", "noopener,noreferrer");
}

export default function NexusConfirmationStep() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <i className="modus-icons text-success text-2xl leading-none">check_circle</i>
        <div className="text-xl font-bold text-foreground">You're all set!</div>
      </div>

      {/* Subtext */}
      <div className="text-sm text-foreground leading-relaxed">
        Here's what we are bringing over to your new sales tax center, review your rates below.
      </div>

      {/* Nexus card — styled to match design */}
      <div
        className="rounded-xl border border-default bg-background p-[18px] flex flex-col gap-2"
        role="region"
        aria-label="Tax nexus confirmation"
      >
        {/* Top row: status badge + edit button */}
        <div className="flex items-center justify-between gap-3">
          <ModusBadge color="success" variant="outlined" size="sm">
            Active Nexus
          </ModusBadge>
          <ModusButton
            variant="outlined"
            color="secondary"
            size="sm"
            icon="share"
            iconPosition="right"
            onButtonClick={openAvalaraNexus}
          >
            Edit
          </ModusButton>
        </div>

        {/* Jurisdiction name */}
        <div className="flex flex-col gap-1">
          <div className="text-xl font-bold text-foreground">Texas (TX)</div>
          <div className="text-sm text-foreground-60">Tax Type: Sales &amp; Use Tax</div>
        </div>

        {/* Divider + extra detail */}
        <div className="border-top-default pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <i className="modus-icons text-success text-lg leading-none">check_circle</i>
            <div className="text-sm text-foreground">
              Registered for Sales &amp; Use Tax in Texas
            </div>
          </div>

          <div className="flex items-start gap-2">
            <i className="modus-icons text-foreground-40 text-lg leading-none mt-0.5">info</i>
            <div className="text-xs text-foreground-60 leading-relaxed">
              Your nexus is now active. To review or update settings, use the Edit button above —
              it opens Avalara in a new tab.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
