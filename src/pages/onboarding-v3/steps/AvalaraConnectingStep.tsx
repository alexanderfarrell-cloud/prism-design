import { useEffect } from "react";

interface AvalaraConnectingStepProps {
  onComplete: () => void;
}

export default function AvalaraConnectingStep({ onComplete }: AvalaraConnectingStepProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <div className="text-xl font-bold text-foreground">Almost there!</div>

        <div className="text-sm text-foreground leading-relaxed">
          Your onboarding is now complete and our digital construction crew is hard at work
          building your new account! It should only be a few minutes.
        </div>

        <div className="text-sm text-foreground leading-relaxed">
          You will receive an email from our partner Avalara, once the paint is dry, so feel
          free to grab a coffee and come back whenever you're ready.
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
