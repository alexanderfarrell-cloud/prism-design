import { useNavigate } from "react-router-dom";
import ModusButton from "../../../components/ModusButton";

interface WizardFooterProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isFirstScreen: boolean;
  isLastScreen: boolean;
}

export default function WizardFooter({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isFirstScreen,
  isLastScreen,
}: WizardFooterProps) {
  const navigate = useNavigate();

  return (
    <div className="border-top-default bg-background px-8 py-3 flex items-center justify-between">
      <div className="w-[160px]">
        {isFirstScreen ? (
          <ModusButton
            variant="borderless"
            color="secondary"
            size="lg"
            icon="arrow_back"
            iconPosition="left"
            onButtonClick={() => navigate("/")}
          >
            Dashboard
          </ModusButton>
        ) : (
          <ModusButton
            color="secondary"
            variant="filled"
            size="lg"
            shape="rectangle"
            icon="arrow_back"
            iconPosition="only"
            ariaLabel="Go back"
            onButtonClick={onBack}
          />
        )}
      </div>

      <div className="text-sm font-semibold text-foreground">
        {!isFirstScreen && !isLastScreen && (
          <div>Step {currentStep} of {totalSteps}</div>
        )}
      </div>

      <div className="w-[120px] flex justify-end">
        {isLastScreen ? (
          <ModusButton
            key="btn-finish"
            color="primary"
            variant="filled"
            size="lg"
            onButtonClick={onNext}
          >
            Go to Payroll
          </ModusButton>
        ) : isFirstScreen ? (
          <ModusButton
            key="btn-start"
            color="primary"
            variant="filled"
            size="lg"
            onButtonClick={onNext}
          >
            Get Started
          </ModusButton>
        ) : (
          <ModusButton
            key={`btn-next-${currentStep}`}
            color="primary"
            variant="filled"
            size="lg"
            onButtonClick={onNext}
          >
            Next
          </ModusButton>
        )}
      </div>
    </div>
  );
}
