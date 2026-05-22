import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../../hooks/usePageTitle";
import WizardHeader from "./WizardHeader";
import WizardFooter from "./WizardFooter";
import WelcomeStep from "./steps/WelcomeStep";
import CompanyInfoStep from "./steps/CompanyInfoStep";
import TaxSetupStep from "./steps/TaxSetupStep";
import TaxNexusConfirmationStep from "./steps/TaxNexusConfirmationStep";
import PayScheduleStep from "./steps/PayScheduleStep";
import BankAccountStep from "./steps/BankAccountStep";
import AddEmployeeStep from "./steps/AddEmployeeStep";
import ReviewStep from "./steps/ReviewStep";
import { parseJurisdictionFromAddress } from "./jurisdictionFromAddress";

interface OnboardingData {
  companyName: string;
  entityType: string;
  ein: string;
  address: string;
  suiId: string;
  suiRate: string;
  payFrequency: "weekly" | "biweekly";
  firstWorkDate: string;
  routingNumber: string;
  accountNumber: string;
  accountType: "checking" | "savings";
  employeeFirstName: string;
  employeeLastName: string;
  employeePayType: "hourly" | "salary";
  employeePayRate: string;
  nexusJurisdictionName: string;
  nexusJurisdictionCode: string;
}

const INITIAL_DATA: OnboardingData = {
  companyName: "Alex's Construction LLC",
  entityType: "",
  ein: "12-3456789",
  address: "4521 Oak Ridge Dr, Austin, TX 78745",
  suiId: "",
  suiRate: "",
  payFrequency: "weekly",
  firstWorkDate: "",
  routingNumber: "",
  accountNumber: "",
  accountType: "checking",
  employeeFirstName: "",
  employeeLastName: "",
  employeePayType: "hourly",
  employeePayRate: "",
  nexusJurisdictionName: "",
  nexusJurisdictionCode: "",
};

const TOTAL_NUMBERED_STEPS = 6;

enum WizardStep {
  Welcome = 0,
  CompanyInfo = 1,
  TaxSetup = 2,
  TaxNexusConfirmation = 3,
  PaySchedule = 4,
  BankAccount = 5,
  AddEmployee = 6,
  Review = 7,
}

function readPreviewNexusFromUrl(): boolean {
  try {
    return new URLSearchParams(window.location.search).get("preview") === "nexus";
  } catch {
    return false;
  }
}

function initialDataForUrl(): OnboardingData {
  if (!readPreviewNexusFromUrl()) return INITIAL_DATA;
  const j = parseJurisdictionFromAddress(INITIAL_DATA.address);
  return {
    ...INITIAL_DATA,
    nexusJurisdictionName: j.jurisdictionName,
    nexusJurisdictionCode: j.jurisdictionCode,
  };
}

function initialStepForUrl(): WizardStep {
  return readPreviewNexusFromUrl()
    ? WizardStep.TaxNexusConfirmation
    : WizardStep.Welcome;
}

/** Replace with a real Avalara nexus-creation API call; resolves only on HTTP success. */
async function createTaxNexusViaAvalara(): Promise<void> {
  await new Promise((r) => setTimeout(r, 850));
}

export default function PayrollOnboardingPage() {
  usePageTitle("Payroll Setup");
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStepForUrl);
  const [data, setData] = useState<OnboardingData>(initialDataForUrl);
  const [isCreatingNexus, setIsCreatingNexus] = useState(false);

  const handleUpdate = useCallback(
    (field: string, value: string) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleNext = useCallback(async () => {
    if (currentStep === WizardStep.Review) {
      navigate("/payroll");
      return;
    }

    if (currentStep === WizardStep.TaxSetup) {
      setIsCreatingNexus(true);
      try {
        await createTaxNexusViaAvalara();
        const { jurisdictionName, jurisdictionCode } =
          parseJurisdictionFromAddress(data.address);
        setData((prev) => ({
          ...prev,
          nexusJurisdictionName: jurisdictionName,
          nexusJurisdictionCode: jurisdictionCode,
        }));
        setCurrentStep(WizardStep.TaxNexusConfirmation);
      } finally {
        setIsCreatingNexus(false);
      }
      return;
    }

    setCurrentStep((prev) => prev + 1);
  }, [currentStep, navigate, data.address]);

  const handleBack = useCallback(() => {
    if (currentStep > WizardStep.Welcome) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const getNumberedStep = (): number => {
    if (currentStep <= WizardStep.Welcome) return 0;
    if (currentStep >= WizardStep.Review) return 0;
    return currentStep;
  };

  const nextLabelOverride =
    currentStep === WizardStep.TaxSetup && isCreatingNexus
      ? "Creating nexus…"
      : undefined;

  const renderStep = () => {
    switch (currentStep) {
      case WizardStep.Welcome:
        return <WelcomeStep />;
      case WizardStep.CompanyInfo:
        return (
          <CompanyInfoStep
            companyName={data.companyName}
            entityType={data.entityType}
            ein={data.ein}
            onUpdate={handleUpdate}
          />
        );
      case WizardStep.TaxSetup:
        return (
          <TaxSetupStep
            suiId={data.suiId}
            suiRate={data.suiRate}
            onUpdate={handleUpdate}
          />
        );
      case WizardStep.TaxNexusConfirmation:
        return (
          <TaxNexusConfirmationStep
            jurisdictionName={data.nexusJurisdictionName}
            jurisdictionCode={data.nexusJurisdictionCode}
          />
        );
      case WizardStep.PaySchedule:
        return (
          <PayScheduleStep
            payFrequency={data.payFrequency}
            firstWorkDate={data.firstWorkDate}
            onUpdate={handleUpdate}
          />
        );
      case WizardStep.BankAccount:
        return (
          <BankAccountStep
            routingNumber={data.routingNumber}
            accountNumber={data.accountNumber}
            accountType={data.accountType}
            onUpdate={handleUpdate}
          />
        );
      case WizardStep.AddEmployee:
        return (
          <AddEmployeeStep
            employeeFirstName={data.employeeFirstName}
            employeeLastName={data.employeeLastName}
            employeePayType={data.employeePayType}
            employeePayRate={data.employeePayRate}
            onUpdate={handleUpdate}
          />
        );
      case WizardStep.Review:
        return (
          <ReviewStep
            companyName={data.companyName}
            entityType={data.entityType}
            ein={data.ein}
            suiId={data.suiId}
            suiRate={data.suiRate}
            nexusJurisdictionName={data.nexusJurisdictionName}
            nexusJurisdictionCode={data.nexusJurisdictionCode}
            payFrequency={data.payFrequency}
            firstWorkDate={data.firstWorkDate}
            accountType={data.accountType}
            routingNumber={data.routingNumber}
            employeeFirstName={data.employeeFirstName}
            employeeLastName={data.employeeLastName}
            employeePayType={data.employeePayType}
            employeePayRate={data.employeePayRate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <WizardHeader />

      <div className="flex-1 overflow-auto py-8">{renderStep()}</div>

      <WizardFooter
        currentStep={getNumberedStep()}
        totalSteps={TOTAL_NUMBERED_STEPS}
        onBack={handleBack}
        onNext={() => void handleNext()}
        isFirstScreen={currentStep === WizardStep.Welcome}
        isLastScreen={currentStep === WizardStep.Review}
        backDisabled={isCreatingNexus}
        nextDisabled={isCreatingNexus}
        nextLabel={nextLabelOverride}
      />
    </div>
  );
}
