import WizardStepLayout from "../WizardStepLayout";
import TaxNexusCard, { AVALARA_NEXUS_ADMIN_URL } from "../TaxNexusCard";

export { AVALARA_NEXUS_ADMIN_URL };

interface TaxNexusConfirmationStepProps {
  jurisdictionName: string;
  jurisdictionCode: string;
}

export default function TaxNexusConfirmationStep({
  jurisdictionName,
  jurisdictionCode,
}: TaxNexusConfirmationStepProps) {
  return (
    <WizardStepLayout
      title="Tax nexus configured"
      subtitle="This confirmation appears after Avalara successfully creates your nexus. Tax setup for this step is complete."
    >
      <TaxNexusCard
        jurisdictionName={jurisdictionName}
        jurisdictionCode={jurisdictionCode}
        showAvalaraActions
      />
    </WizardStepLayout>
  );
}
