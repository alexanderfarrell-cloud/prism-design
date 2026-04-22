import OnboardingHeader from './OnboardingHeader'

interface OnboardingLayoutProps {
  children: React.ReactNode
  bottomBar?: React.ReactNode
}

export default function OnboardingLayout({ children, bottomBar }: OnboardingLayoutProps) {
  return (
    <div className="ob-shell">
      <OnboardingHeader />
      <main className="ob-main">
        <div className="ob-content">
          {children}
        </div>
      </main>
      {bottomBar && (
        <div className="ob-bottom-wrapper">
          {bottomBar}
        </div>
      )}
    </div>
  )
}
