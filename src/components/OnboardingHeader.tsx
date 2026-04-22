export default function OnboardingHeader() {
  return (
    <header className="ob-header">
      <div className="ob-header-logo">
        <span className="ob-logo-icon">⬡</span>
        <span className="ob-logo-text">financials</span>
      </div>
      <div className="ob-header-actions">
        <span className="ob-demo-badge">Demo</span>
        <button className="ob-exit-btn">Exit</button>
      </div>
    </header>
  )
}
