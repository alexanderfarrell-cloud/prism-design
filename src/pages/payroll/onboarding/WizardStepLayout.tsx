import type { ReactNode } from "react";

interface WizardStepLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function WizardStepLayout({
  title,
  subtitle,
  children,
}: WizardStepLayoutProps) {
  return (
    <div className="max-w-xl mx-auto w-full px-6">
      <div className="flex flex-col gap-3 mb-8">
        <div className="text-2xl text-foreground">{title}</div>
        <div className="text-base text-foreground-60">{subtitle}</div>
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}
