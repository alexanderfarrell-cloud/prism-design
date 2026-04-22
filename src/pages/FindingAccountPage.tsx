import { useEffect } from 'react'
import OnboardingLayout from '../components/OnboardingLayout'
import Spinner from '../components/Spinner'

interface FindingAccountPageProps {
  onNext: () => void
}

export default function FindingAccountPage({ onNext }: FindingAccountPageProps) {
  useEffect(() => {
    const timer = setTimeout(onNext, 2500)
    return () => clearTimeout(timer)
  }, [onNext])

  return (
    <OnboardingLayout>
      <h1 className="ob-title">Finding your account</h1>
      <p className="ob-subtitle">
        We're looking up your Avalara account details. This should only take a moment.
      </p>
      <div className="ob-spinner-wrap">
        <Spinner />
      </div>
    </OnboardingLayout>
  )
}
