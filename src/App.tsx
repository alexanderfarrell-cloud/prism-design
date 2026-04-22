import { useState } from 'react'
import { ModusWcThemeProvider } from '@trimble-oss/moduswebcomponents-react'
import { type Step, type FormData, INITIAL_FORM_DATA } from './types'

import IntroPage from './pages/IntroPage'
import PersonalInfoPage from './pages/PersonalInfoPage'
import CompanyPage from './pages/CompanyPage'
import LocationPage from './pages/LocationPage'
import TaxCompliancePage from './pages/TaxCompliancePage'
import AvalaraCredentialsPage from './pages/AvalaraCredentialsPage'
import FindingAccountPage from './pages/FindingAccountPage'
import SelectCompanyPage from './pages/SelectCompanyPage'
import ReviewPage from './pages/ReviewPage'
import ProcessingPage from './pages/ProcessingPage'
import CompletePage from './pages/CompletePage'

export default function App() {
  const [step, setStep] = useState<Step>('intro')
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)

  function updateForm(patch: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...patch }))
  }

  function restart() {
    setFormData(INITIAL_FORM_DATA)
    setStep('intro')
  }

  function goNext() {
    setStep((cur) => {
      switch (cur) {
        case 'intro': return 'personal-info'
        case 'personal-info': return 'company'
        case 'company': return 'location'
        case 'location': return 'tax-compliance'
        case 'tax-compliance':
          return formData.hasAvalaraAccount ? 'avalara-credentials' : 'review'
        case 'avalara-credentials': return 'finding-account'
        case 'finding-account': return 'select-company'
        case 'select-company': return 'review'
        case 'review': return 'processing'
        case 'processing': return 'complete'
        default: return cur
      }
    })
  }

  function goBack() {
    setStep((cur) => {
      switch (cur) {
        case 'personal-info': return 'intro'
        case 'company': return 'personal-info'
        case 'location': return 'company'
        case 'tax-compliance': return 'location'
        case 'avalara-credentials': return 'tax-compliance'
        case 'finding-account': return 'avalara-credentials'
        case 'select-company': return 'finding-account'
        case 'review':
          return formData.hasAvalaraAccount ? 'select-company' : 'tax-compliance'
        default: return cur
      }
    })
  }

  function renderPage() {
    switch (step) {
      case 'intro':
        return <IntroPage onStart={goNext} />
      case 'personal-info':
        return (
          <PersonalInfoPage
            formData={formData}
            onUpdate={updateForm}
            onNext={goNext}
            onBack={goBack}
            stepInfo={{ current: 1, total: 4 }}
          />
        )
      case 'company':
        return (
          <CompanyPage
            formData={formData}
            onUpdate={updateForm}
            onNext={goNext}
            onBack={goBack}
            stepInfo={{ current: 2, total: 4 }}
          />
        )
      case 'location':
        return (
          <LocationPage
            formData={formData}
            onUpdate={updateForm}
            onNext={goNext}
            onBack={goBack}
            stepInfo={{ current: 3, total: 4 }}
          />
        )
      case 'tax-compliance':
        return (
          <TaxCompliancePage
            formData={formData}
            onUpdate={updateForm}
            onNext={goNext}
            onBack={goBack}
          />
        )
      case 'avalara-credentials':
        return (
          <AvalaraCredentialsPage
            formData={formData}
            onUpdate={updateForm}
            onNext={goNext}
            onBack={goBack}
            stepInfo={{ current: 4, total: 6 }}
          />
        )
      case 'finding-account':
        return <FindingAccountPage onNext={goNext} />
      case 'select-company':
        return (
          <SelectCompanyPage
            formData={formData}
            onUpdate={updateForm}
            onNext={goNext}
            onBack={goBack}
            stepInfo={{ current: 5, total: 6 }}
          />
        )
      case 'review':
        return (
          <ReviewPage
            formData={formData}
            onSubmit={goNext}
            onBack={goBack}
            onEditSection={setStep}
            stepInfo={
              formData.hasAvalaraAccount
                ? { current: 6, total: 6 }
                : { current: 4, total: 4 }
            }
          />
        )
      case 'processing':
        return <ProcessingPage onNext={goNext} />
      case 'complete':
        return <CompletePage onRestart={restart} />
      default:
        return null
    }
  }

  return (
    <ModusWcThemeProvider>
      {renderPage()}
    </ModusWcThemeProvider>
  )
}
