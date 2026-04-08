import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OnboardingShell } from './onboarding/OnboardingShell'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding/welcome" replace />} />
        <Route path="/onboarding" element={<Navigate to="/onboarding/welcome" replace />} />
        <Route path="/onboarding/:stepId" element={<OnboardingShell />} />
        <Route path="*" element={<Navigate to="/onboarding/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
