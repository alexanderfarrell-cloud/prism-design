import { useNavigate } from "react-router-dom";
import ModusButton from "../../../components/ModusButton";

interface WizardFooterProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isFirstScreen: boolean;
  isLastScreen: boolean;
  /** When true, back is disabled (e.g. during an in-flight save). */
  backDisabled?: boolean;
  /** When true, primary forward action is disabled. */
  nextDisabled?: boolean;
  /** Override label for the primary forward button (default: Next / Get Started / Go to Payroll). */
  nextLabel?: string;
  /** When true, the last screen shows "Restart Demo" instead of "Go to Payroll". */
  demoMode?: boolean;
}

export default function WizardFooter({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isFirstScreen,
  isLastScreen,
  backDisabled = false,
  nextDisabled = false,
  nextLabel,
  demoMode = false,
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
            disabled={backDisabled}
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
            disabled={nextDisabled}
            icon={demoMode ? "refresh" : undefined}
            iconPosition={demoMode ? "left" : undefined}
            onButtonClick={onNext}
          >
            {nextLabel ?? (demoMode ? "Restart Demo" : "Go to Payroll")}
          </ModusButton>
        ) : isFirstScreen ? (
          <ModusButton
            key="btn-start"
            color="primary"
            variant="filled"
            size="lg"
            disabled={nextDisabled}
            onButtonClick={onNext}
          >
            {nextLabel ?? "Get Started"}
          </ModusButton>
        ) : (
          <ModusButton
            key={`btn-next-${currentStep}`}
            color="primary"
            variant="filled"
            size="lg"
            disabled={nextDisabled}
            onButtonClick={onNext}
          >
            {nextLabel ?? "Next"}
          </ModusButton>
        )}
      </div>
    </div>
  );
}
