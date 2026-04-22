import { useEffect } from 'react'
import OnboardingLayout from '../components/OnboardingLayout'
import Spinner from '../components/Spinner'

interface ProcessingPageProps {
  onNext: () => void
}

export default function ProcessingPage({ onNext }: ProcessingPageProps) {
  useEffect(() => {
    const timer = setTimeout(onNext, 3500)
    return () => clearTimeout(timer)
  }, [onNext])

  return (
    <OnboardingLayout>
      <h1 className="ob-title">Almost there!</h1>
      <p className="ob-body-text">
        Your onboarding is now complete and our digital construction crew is hard at work building
        your new account! It should only be a few minutes.
      </p>
      <p className="ob-body-text" style={{ marginTop: '1rem' }}>
        You will receive an email from our partner Avalara, once the paint is dry, so feel free to
        grab a coffee and come back whenever you're ready.
      </p>
      <div className="ob-spinner-wrap">
        <Spinner />
      </div>
    </OnboardingLayout>
  )
}
