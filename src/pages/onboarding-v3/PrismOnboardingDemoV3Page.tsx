import { useState, useCallback } from "react";
import ModusLogo from "../../components/ModusLogo";
import ModusButton from "../../components/ModusButton";
import WelcomeStep from "./steps/WelcomeStep";
import AvalaraQuestionStep from "./steps/AvalaraQuestionStep";
import AvalaraCredentialsStep from "./steps/AvalaraCredentialsStep";
import AvalaraLookupStep from "./steps/AvalaraLookupStep";
import AvalaraCompanySelectStep, { DEMO_COMPANIES } from "./steps/AvalaraCompanySelectStep";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import BusinessInfoStep from "./steps/BusinessInfoStep";
import TaxLocationStep from "./steps/TaxLocationStep";
import ReviewStep from "./steps/ReviewStep";
import AvalaraConnectingStep from "./steps/AvalaraConnectingStep";
import NexusConfirmationStep from "./steps/NexusConfirmationStep";
import ProfileCompleteStep from "./steps/ProfileCompleteStep";

enum Step {
  Welcome = 0,
  AvalaraQuestion = 1,
  AvalaraCredentials = 2,
  AvalaraLookup = 3,
  AvalaraCompanySelect = 4,
  PersonalInfo = 5,
  Business = 6,
  TaxLocation = 7,
  ProfileComplete = 8,
  Review = 9,
  AvalaraConnecting = 10,
  NexusConfirmation = 11,
  Done = 12,
}

// YES path: all users fill profile first, then connect existing Avalara account
const YES_PATH: Step[] = [
  Step.Welcome,
  Step.PersonalInfo,
  Step.Business,
  Step.TaxLocation,
  Step.ProfileComplete,
  Step.AvalaraQuestion,
  Step.AvalaraCredentials,
  Step.AvalaraLookup,
  Step.AvalaraCompanySelect,
  Step.Review,
  Step.AvalaraConnecting,
  Step.NexusConfirmation,
];

// NO path: same shared profile steps, Avalara account created from collected data
const NO_PATH: Step[] = [
  Step.Welcome,
  Step.PersonalInfo,
  Step.Business,
  Step.TaxLocation,
  Step.ProfileComplete,
  Step.AvalaraQuestion,
  Step.Review,
  Step.AvalaraConnecting,
  Step.NexusConfirmation,
];

const YES_FORM_STEPS = [
  Step.PersonalInfo,
  Step.Business,
  Step.TaxLocation,
  Step.AvalaraCredentials,
  Step.AvalaraCompanySelect,
  Step.Review,
];

const NO_FORM_STEPS = [
  Step.PersonalInfo,
  Step.Business,
  Step.TaxLocation,
  Step.Review,
];

export default function PrismOnboardingDemoV3Page() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Welcome);
  const [hasAvalaraAccount, setHasAvalaraAccount] = useState<boolean | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>("1");

  const selectedCompany = DEMO_COMPANIES.find((c) => c.id === selectedCompanyId) ?? null;
  const [selectedCity, selectedState] = selectedCompany
    ? selectedCompany.location.split(", ")
    : [undefined, undefined];

  const isWelcome = currentStep === Step.Welcome;
  const isDone = currentStep === Step.NexusConfirmation;
  const isConnecting = currentStep === Step.AvalaraConnecting;
  const isLookup = currentStep === Step.AvalaraLookup;

  const activePath = hasAvalaraAccount === true ? YES_PATH : hasAvalaraAccount === false ? NO_PATH : null;
  // Before AvalaraQuestion is answered, use NO_FORM_STEPS as the baseline for the counter
  // (both paths share PersonalInfo, Business, TaxLocation as the first 3 form steps)
  const formSteps = hasAvalaraAccount === true ? YES_FORM_STEPS : NO_FORM_STEPS;

  const showStepCounter = formSteps.includes(currentStep);
  const stepCounterIndex = formSteps.indexOf(currentStep);

  const isFormHeadingStep = [
    Step.AvalaraCredentials,
    Step.AvalaraCompanySelect,
    Step.PersonalInfo,
    Step.Business,
    Step.TaxLocation,
  ].includes(currentStep);

  const handleNext = useCallback(() => {
    if (isDone) {
      setCurrentStep(Step.Welcome);
      setHasAvalaraAccount(null);
      setSelectedCompanyId("1");
      return;
    }

    // Welcome always advances to PersonalInfo
    if (currentStep === Step.Welcome) {
      setCurrentStep(Step.PersonalInfo);
      return;
    }

    // Shared pre-branch steps (before AvalaraQuestion, activePath not yet set)
    if (currentStep === Step.PersonalInfo) { setCurrentStep(Step.Business); return; }
    if (currentStep === Step.Business) { setCurrentStep(Step.TaxLocation); return; }
    if (currentStep === Step.TaxLocation) { setCurrentStep(Step.ProfileComplete); return; }
    if (currentStep === Step.ProfileComplete) { setCurrentStep(Step.AvalaraQuestion); return; }

    // After AvalaraQuestion, branch based on selection
    if (currentStep === Step.AvalaraQuestion) {
      if (hasAvalaraAccount === true) {
        setCurrentStep(Step.AvalaraCredentials);
      } else if (hasAvalaraAccount === false) {
        setCurrentStep(Step.Review);
      }
      return;
    }

    if (!activePath) return;
    const idx = activePath.indexOf(currentStep);
    if (idx !== -1 && idx < activePath.length - 1) {
      setCurrentStep(activePath[idx + 1]);
    }
  }, [currentStep, isDone, hasAvalaraAccount, activePath]);

  const handleBack = useCallback(() => {
    if (currentStep === Step.Welcome) return;

    // Shared pre-branch steps (back navigation before AvalaraQuestion)
    if (currentStep === Step.PersonalInfo) { setCurrentStep(Step.Welcome); return; }
    if (currentStep === Step.Business) { setCurrentStep(Step.PersonalInfo); return; }
    if (currentStep === Step.TaxLocation) { setCurrentStep(Step.Business); return; }
    if (currentStep === Step.ProfileComplete) { setCurrentStep(Step.TaxLocation); return; }

    // Back from AvalaraQuestion always returns to ProfileComplete hub
    if (currentStep === Step.AvalaraQuestion) {
      setCurrentStep(Step.ProfileComplete);
      return;
    }

    if (!activePath) return;

    const idx = activePath.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(activePath[idx - 1]);
    }
  }, [currentStep, activePath]);

  const nextLabel = () => {
    if (isDone) return "Restart Demo";
    if (currentStep === Step.Review) return "Submit";
    if (isWelcome) return "Get Started";
    if (currentStep === Step.ProfileComplete) return "Start tax setup";
    return "Next";
  };

  const isNextDisabled = () => {
    if (currentStep === Step.AvalaraQuestion) return hasAvalaraAccount === null;
    if (currentStep === Step.AvalaraCompanySelect) return selectedCompanyId === null;
    return false;
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.Welcome:
        return <WelcomeStep />;
      case Step.AvalaraQuestion:
        return (
          <AvalaraQuestionStep
            selected={hasAvalaraAccount}
            onSelect={(val) => setHasAvalaraAccount(val)}
          />
        );
      case Step.AvalaraCredentials:
        return <AvalaraCredentialsStep />;
      case Step.AvalaraLookup:
        return <AvalaraLookupStep onComplete={() => setCurrentStep(Step.AvalaraCompanySelect)} />;
      case Step.AvalaraCompanySelect:
        return (
          <AvalaraCompanySelectStep
            selectedCompanyId={selectedCompanyId}
            onSelect={(id) => setSelectedCompanyId(id)}
          />
        );
      case Step.ProfileComplete:
        return <ProfileCompleteStep />;
      case Step.PersonalInfo:
        return <PersonalInfoStep />;
      case Step.Business:
        return <BusinessInfoStep />;
      case Step.TaxLocation:
        return <TaxLocationStep />;
      case Step.Review:
        return (
          <ReviewStep
            companyName={selectedCompany?.name}
            companyCity={selectedCity}
            companyState={selectedState}
            fromAvalara={hasAvalaraAccount === true}
            selectedAvalaraAccount={
              hasAvalaraAccount === true && selectedCompany
                ? {
                    name: selectedCompany.name,
                    location: selectedCompany.location,
                    accountId: selectedCompany.accountId,
                  }
                : null
            }
          />
        );
      case Step.AvalaraConnecting:
        return <AvalaraConnectingStep onComplete={() => setCurrentStep(Step.NexusConfirmation)} />;
      case Step.NexusConfirmation:
        return <NexusConfirmationStep />;
      default:
        return null;
    }
  };

  const hideFooter = isConnecting || isLookup;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col shadow-sm">

        {/* Header */}
        <div className="border-bottom-default bg-background px-5 py-4 flex items-center shrink-0">
          <ModusLogo name="financials" customClass="h-8 w-auto" />
        </div>

        {/* Step content */}
        <div className="flex-1 px-5 py-5 overflow-auto">
          {isFormHeadingStep && (
            <div className="text-2xl font-bold text-foreground tracking-tight mb-5">
              Welcome to Trimble Financials
            </div>
          )}
          {renderStep()}
        </div>

        {/* Footer — hidden on auto-advancing screens */}
        <div className={`border-top-default bg-background px-4 py-4 shrink-0 ${hideFooter ? "invisible" : ""}`}>
          {isWelcome ? (
            <div className="flex justify-end">
              <ModusButton
                color="primary"
                variant="filled"
                size="lg"
                onButtonClick={handleNext}
              >
                Get Started
              </ModusButton>
            </div>
          ) : isDone ? (
            <div className="flex justify-end">
              <ModusButton
                color="primary"
                variant="filled"
                size="lg"
                icon="refresh"
                iconPosition="left"
                onButtonClick={handleNext}
              >
                Restart Demo
              </ModusButton>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <ModusButton
                color="secondary"
                variant="filled"
                size="lg"
                icon="arrow_back"
                iconPosition="only"
                ariaLabel="Back"
                onButtonClick={handleBack}
              />
              {showStepCounter && (
                <div className="text-sm font-semibold text-foreground">
                  Step {stepCounterIndex + 1} of {formSteps.length}
                </div>
              )}
              <ModusButton
                color="primary"
                variant="filled"
                size="lg"
                disabled={isNextDisabled()}
                onButtonClick={handleNext}
              >
                {nextLabel()}
              </ModusButton>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
