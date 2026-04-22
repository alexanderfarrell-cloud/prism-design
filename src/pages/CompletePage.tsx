import OnboardingLayout from '../components/OnboardingLayout'
import BottomBar from '../components/BottomBar'

interface CompletePageProps {
  onRestart: () => void
}

export default function CompletePage({ onRestart }: CompletePageProps) {
  return (
    <OnboardingLayout
      bottomBar={
        <BottomBar
          onNext={onRestart}
          nextLabel="↺  Restart Demo"
          hideBack
        />
      }
    >
      <div className="ob-complete-header">
        <span className="ob-complete-check" aria-hidden="true">✓</span>
        <h1 className="ob-title ob-title-inline">You're all set!</h1>
      </div>
      <p className="ob-subtitle">
        Here's what we are bringing over to your new sales tax center, review your rates below.
      </p>

      <div className="ob-nexus-card">
        <div className="ob-nexus-card-header">
          <span className="ob-nexus-badge">Active Nexus</span>
          <button className="ob-nexus-edit-btn">Edit  ↗</button>
        </div>

        <p className="ob-nexus-state">Texas (TX)</p>
        <p className="ob-nexus-tax-type">Tax Type: Sales & Use Tax</p>

        <hr className="ob-review-divider" />

        <div className="ob-nexus-status-row">
          <span className="ob-nexus-status-check" aria-hidden="true">✓</span>
          <p className="ob-nexus-status-text">Registered for Sales & Use Tax in Texas</p>
        </div>

        <p className="ob-nexus-info">
          Your nexus is now active. To review or update settings, use the Edit button above — it
          opens Avalara in a new tab.
        </p>
      </div>
    </OnboardingLayout>
  )
}
