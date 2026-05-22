import ModusBadge from "../../../components/ModusBadge";

export default function DoneStep() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-3 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-20">
          <i className="modus-icons text-4xl text-success">check_circle</i>
        </div>
        <div className="text-2xl font-bold text-foreground tracking-tight">You're all set!</div>
        <div className="text-sm text-foreground-60 leading-relaxed">
          Your account has been configured and your tax nexus is active. You can now access all Trimble Financials features.
        </div>
      </div>

      <div className="rounded-xl border border-default bg-card overflow-hidden">
        <div className="px-4 py-3 border-bottom-default bg-muted">
          <div className="text-xs font-bold uppercase tracking-wide text-foreground-60">
            Configured jurisdictions
          </div>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <i className="modus-icons text-success text-lg">check_circle</i>
              <div className="text-sm font-semibold text-foreground">Texas</div>
            </div>
            <ModusBadge color="secondary" variant="outlined" size="sm">TX</ModusBadge>
          </div>
          <div className="flex items-center justify-between gap-3 border-top-default pt-3">
            <div className="text-xs text-foreground-40">Tax Type</div>
            <div className="text-xs font-semibold text-foreground">Sales &amp; Use Tax</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-warning-20 border border-warning px-4 py-3 text-xs text-foreground-60 text-center">
        This is a demo. Click <div className="inline font-semibold text-foreground">Restart Demo</div> below to run through the flow again.
      </div>
    </div>
  );
}
