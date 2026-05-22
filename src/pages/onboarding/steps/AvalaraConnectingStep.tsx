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

      {/* Illustration with animated gear overlays */}
      <div className="relative flex justify-center mt-2 select-none">
        <img
          src="/images/avalara-connecting.png"
          alt="Digital construction crew building your account"
          className="w-full max-w-sm"
        />

        {/* Large clockwise gear — overlays the big blue gear */}
        <i
          className="modus-icons absolute top-[30%] left-[62%] text-[4.5rem] text-primary opacity-50 gear-spin-cw pointer-events-none"
          aria-hidden
        >
          settings
        </i>

        {/* Small counter-clockwise gear — overlays the orange gear */}
        <i
          className="modus-icons absolute top-[18%] left-[80%] text-[2.75rem] text-warning opacity-60 gear-spin-ccw pointer-events-none"
          aria-hidden
        >
          settings
        </i>
      </div>
    </div>
  );
}
