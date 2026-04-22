import OnboardingLayout from '../components/OnboardingLayout'
import BottomBar from '../components/BottomBar'

interface IntroPageProps {
  onStart: () => void
}

const steps = [
  {
    icon: '👤',
    title: 'Personal Info',
    desc: 'Confirm your personal and contact information.',
  },
  {
    icon: '🏢',
    title: 'Company',
    desc: 'Tell us all about your company.',
  },
  {
    icon: '📄',
    title: 'Tax Info',
    desc: "Tell us about your company's tax information.",
  },
  {
    icon: '📍',
    title: 'Location',
    desc: 'Tell us where your company is located.',
  },
]

export default function IntroPage({ onStart }: IntroPageProps) {
  return (
    <OnboardingLayout
      bottomBar={
        <BottomBar
          onNext={onStart}
          nextLabel="Get Started"
          hideBack
        />
      }
    >
      <h1 className="ob-title">Welcome to Trimble Financials</h1>
      <p className="ob-subtitle">We'll get you set up after taking these four easy steps.</p>

      <div className="ob-step-list">
        {steps.map((s) => (
          <div key={s.title} className="ob-step-item">
            <span className="ob-step-icon" aria-hidden="true">{s.icon}</span>
            <div>
              <p className="ob-step-name">{s.title}</p>
              <p className="ob-step-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </OnboardingLayout>
  )
}
