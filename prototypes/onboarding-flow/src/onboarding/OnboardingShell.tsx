import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ModusButton from '../components/ModusButton'
import ModusLogo from '../components/ModusLogo'
import { StepPanel } from './StepPanels'
import { STEPS, isValidStepId, stepIndex } from './stepConfig'

/** Steps that use in-page branding only (no shell progress header). */
function usesContentOnlyHeader(stepId: string): boolean {
  return stepId === 'welcome' || stepId === 'personal'
}

export function OnboardingShell() {
  const { stepId } = useParams()
  const navigate = useNavigate()

  if (!stepId || !isValidStepId(stepId)) {
    return <Navigate to="/onboarding/welcome" replace />
  }

  const idx = stepIndex(stepId)
  const total = STEPS.length
  const meta = STEPS[idx]
  const prevId = idx > 0 ? STEPS[idx - 1].id : null
  const nextId = idx < total - 1 ? STEPS[idx + 1].id : null
  const isWelcome = stepId === 'welcome'
  const contentOnlyHeader = usesContentOnlyHeader(stepId)

  return (
    <div
      className={`flex flex-col min-h-[100svh] max-w-[480px] w-full mx-auto bg-background ${isWelcome ? '' : 'shadow-sm'}`}
    >
      {contentOnlyHeader ? (
        <header
          className="shrink-0 border-b border-default bg-background px-5 py-4"
          role="banner"
        >
          <ModusLogo
            name="financials"
            alt="Trimble Financials"
            customClass="block h-8 w-auto max-w-full"
          />
        </header>
      ) : null}
      {!contentOnlyHeader ? (
        <header className="px-7 pt-7 pb-5 border-b border-default">
          <div className="mb-4">
            <ModusLogo
              name="financials"
              alt="Trimble Financials"
              customClass="block h-7 w-auto max-w-full"
            />
          </div>
          <p className="m-0 mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Onboarding prototype
          </p>
          <h1 className="m-0 mb-5 text-xl font-semibold text-foreground tracking-tight">
            {meta.title}
          </h1>
          <div className="flex gap-1.5 mb-2.5" aria-label={`Step ${idx + 1} of ${total}`}>
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex-1 h-1 rounded-sm ${i <= idx ? 'bg-primary' : 'bg-border'}`}
                title={s.title}
              />
            ))}
          </div>
          <p className="m-0 text-xs text-muted-foreground">
            Step {idx + 1} of {total}
          </p>
        </header>
      ) : null}

      <main
        className={`flex-1 ${contentOnlyHeader ? 'px-5 pt-5' : 'px-7 py-6'}`}
      >
        <StepPanel stepId={stepId} />
      </main>

      <footer className="border-t border-default bg-background px-4 py-4">
        {isWelcome ? (
          <div className="flex justify-end">
            <ModusButton
              color="primary"
              variant="filled"
              size="md"
              onButtonClick={() => {
                if (nextId) navigate(`/onboarding/${nextId}`)
                else navigate('/onboarding/welcome')
              }}
            >
              Continue
            </ModusButton>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-0 bg-[#454f54] text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!prevId}
              aria-label="Back"
              onClick={() => prevId && navigate(`/onboarding/${prevId}`)}
            >
              <i className="modus-icons text-xl leading-none">chevron_left</i>
            </button>
            <span className="text-sm text-foreground">
              Step {idx + 1} of {total}
            </span>
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-0 bg-primary text-white shadow-sm transition-opacity hover:opacity-90"
              aria-label={nextId ? 'Next' : 'Start over'}
              onClick={() => {
                if (nextId) navigate(`/onboarding/${nextId}`)
                else navigate('/onboarding/welcome')
              }}
            >
              <i className="modus-icons text-xl leading-none">chevron_right</i>
            </button>
          </div>
        )}
      </footer>

      {!contentOnlyHeader && meta.assignmentNote ? (
        <aside className="m-0 px-7 py-3.5 text-xs text-muted-foreground border-t border-default bg-muted/30 text-left">
          <strong className="text-foreground">For you:</strong> {meta.assignmentNote}
        </aside>
      ) : null}
    </div>
  )
}
