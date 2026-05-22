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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <div className="text-xl font-bold text-foreground">Finding your account</div>

        <div className="text-sm text-foreground leading-relaxed">
          We're looking up your Avalara account details. This should only take a moment.
        </div>

      </div>

      <div className="flex justify-center mt-4">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute w-16 h-16 rounded-full border-4 border-primary-20" />
          <div className="absolute w-16 h-16 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
      </div>
    </div>
  );
}
