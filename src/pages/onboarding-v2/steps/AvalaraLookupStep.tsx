import { useEffect } from "react";

interface AvalaraLookupStepProps {
  onComplete: () => void;
}

export default function AvalaraLookupStep({ onComplete }: AvalaraLookupStepProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute w-16 h-16 rounded-full border-4 border-primary-20" />
          <div className="absolute w-16 h-16 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-xl font-bold text-foreground">Finding your account</div>
          <div className="text-sm text-foreground-60">
            We're looking up your Avalara account details...
          </div>
        </div>

      </div>

      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3">
          <i className="modus-icons text-success text-lg leading-none shrink-0">check_circle</i>
          <div className="text-sm text-foreground">Credentials verified</div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3">
          <div className="relative w-4 h-4 shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-primary-20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <div className="text-sm text-foreground-60">Loading companies...</div>
        </div>
      </div>
    </div>
  );
}
