import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ModusLogo from "../../components/ModusLogo";
import ModusButton from "../../components/ModusButton";
import WelcomeStep from "./steps/WelcomeStep";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import BusinessInfoStep from "./steps/BusinessInfoStep";
import TaxLocationStep from "./steps/TaxLocationStep";
import ReviewStep from "./steps/ReviewStep";
import AvalaraConnectingStep from "./steps/AvalaraConnectingStep";
import NexusConfirmationStep from "./steps/NexusConfirmationStep";
import DoneStep from "./steps/DoneStep";

enum Step {
  Welcome = 0,
  PersonalInfo = 1,
  Business = 2,
  TaxLocation = 3,
  Review = 4,
  AvalaraConnecting = 5,
  NexusConfirmation = 6,
  Done = 7,
}


export default function PrismOnboardingDemoPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(Step.Welcome);

  const isWelcome = currentStep === Step.Welcome;
  const isDone = currentStep === Step.Done;
  const isConnecting = currentStep === Step.AvalaraConnecting;
  const isFormStep = [Step.PersonalInfo, Step.Business, Step.TaxLocation].includes(currentStep);
  const FORM_STEPS = [Step.PersonalInfo, Step.Business, Step.TaxLocation, Step.Review];
  const showStepDots = FORM_STEPS.includes(currentStep);
  const stepDotIndex = FORM_STEPS.indexOf(currentStep);

  const handleNext = useCallback(() => {
    if (isDone) {
      setCurrentStep(Step.Welcome);
      return;
    }
    setCurrentStep((prev) => (prev + 1) as Step);
  }, [isDone]);

  const handleBack = useCallback(() => {
    if (currentStep > Step.Welcome) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case Step.Welcome:           return <WelcomeStep />;
      case Step.PersonalInfo:      return <PersonalInfoStep />;
      case Step.Business:          return <BusinessInfoStep />;
      case Step.TaxLocation:          return <TaxLocationStep />;
      case Step.Review:               return <ReviewStep />;
      case Step.AvalaraConnecting:    return <AvalaraConnectingStep onComplete={() => setCurrentStep(Step.NexusConfirmation)} />;
      case Step.NexusConfirmation:    return <NexusConfirmationStep />;
      case Step.Done:              return <DoneStep />;
      default:                     return null;
    }
  };

  const nextLabel = () => {
    if (isDone) return "Restart Demo";
    if (currentStep === Step.Review) return "Submit";
    if (currentStep === Step.NexusConfirmation) return "Go to dashboard";
    if (isWelcome) return "Get Started";
    return "Next";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col shadow-sm">

        {/* Header */}
        <div className="border-bottom-default bg-background px-5 py-4 flex items-center justify-between shrink-0">
          <ModusLogo name="financials" customClass="h-8 w-auto" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-warning-20 border border-warning px-3 py-1 text-xs font-semibold text-warning">
              <i className="modus-icons text-sm leading-none">play</i>
              Demo
            </div>
            <ModusButton
              variant="borderless"
              color="secondary"
              size="sm"
              onButtonClick={() => navigate("/dashboard")}
            >
              Exit
            </ModusButton>
          </div>
        </div>


        {/* Step content */}
        <div className="flex-1 px-5 py-5 overflow-auto">
          {isFormStep && (
            <div className="text-2xl font-bold text-foreground tracking-tight mb-5">
              Welcome to Trimble Financials
            </div>
          )}
          {renderStep()}
        </div>

        {/* Footer — hidden on the auto-advancing Avalara connecting screen */}
        <div className={`border-top-default bg-background px-4 py-4 shrink-0 ${isConnecting ? "invisible" : ""}`}>
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
              {showStepDots && (
                <div className="text-sm font-semibold text-foreground">
                  Step {stepDotIndex + 1} of {FORM_STEPS.length}
                </div>
              )}
              <ModusButton
                color="primary"
                variant="filled"
                size="lg"
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
