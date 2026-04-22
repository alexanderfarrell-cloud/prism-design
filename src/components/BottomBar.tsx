import type { StepInfo } from '../types'

interface BottomBarProps {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  stepInfo?: StepInfo | null
  hideBack?: boolean
}

export default function BottomBar({
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  stepInfo,
  hideBack = false,
}: BottomBarProps) {
  return (
    <div className="ob-bottom-bar">
      {!hideBack && onBack ? (
        <button className="ob-btn-back" onClick={onBack} aria-label="Go back">
          ←
        </button>
      ) : (
        <div className="ob-bottom-spacer" />
      )}

      {stepInfo ? (
        <span className="ob-step-label">Step {stepInfo.current} of {stepInfo.total}</span>
      ) : (
        <div className="ob-bottom-spacer" />
      )}

      {onNext ? (
        <button
          className={`ob-btn-next${nextDisabled ? ' disabled' : ''}`}
          onClick={nextDisabled ? undefined : onNext}
          disabled={nextDisabled}
        >
          {nextLabel}
        </button>
      ) : (
        <div className="ob-bottom-spacer" />
      )}
    </div>
  )
}
