import { useState } from 'react'
import OnboardingLayout from '../components/OnboardingLayout'
import BottomBar from '../components/BottomBar'
import { COMPANIES } from '../data/companies'
import type { FormData, Step, StepInfo } from '../types'

interface ReviewPageProps {
  formData: FormData
  onSubmit: () => void
  onBack: () => void
  onEditSection: (step: Step) => void
  stepInfo: StepInfo
}

export default function ReviewPage({
  formData,
  onSubmit,
  onBack,
  onEditSection,
  stepInfo,
}: ReviewPageProps) {
  const [einVisible, setEinVisible] = useState(false)

  const selectedCompany = COMPANIES.find((c) => c.id === formData.selectedCompanyId) ?? null
  const selectedCompanyName = selectedCompany?.name ?? formData.companyName

  return (
    <OnboardingLayout
      bottomBar={
        <BottomBar onBack={onBack} onNext={onSubmit} nextLabel="Submit" stepInfo={stepInfo} />
      }
    >
      <h1 className="ob-title">Welcome to Trimble Financials</h1>
      <p className="ob-subtitle">
        Review your information before submitting. Click on the headers you wish to edit.
      </p>

      {selectedCompany && formData.hasAvalaraAccount && (
        <div className="ob-selected-company-card">
          <p className="ob-selected-company-label">Selected Avalara Company</p>
          <div className="ob-selected-company-body">
            <div>
              <p className="ob-selected-company-name">{selectedCompany.name}</p>
              <p className="ob-selected-company-meta">{selectedCompany.location}</p>
              <p className="ob-selected-company-meta">Account ID: {selectedCompany.accountId}</p>
            </div>
            <button
              className="ob-selected-company-change"
              onClick={() => onEditSection('select-company')}
            >
              Change
            </button>
          </div>
        </div>
      )}

      <div className="ob-review-sections">
        <section className="ob-review-section">
          <button className="ob-review-section-title" onClick={() => onEditSection('company')}>
            Company
          </button>
          <div className="ob-review-grid">
            <div>
              <p className="ob-review-label">Company Name</p>
              <p className="ob-review-value">{selectedCompanyName}</p>
            </div>
            <div>
              <p className="ob-review-label">Company Type</p>
              <p className="ob-review-value">LLC</p>
            </div>
          </div>
          <hr className="ob-review-divider" />
        </section>

        <section className="ob-review-section">
          <button className="ob-review-section-title" onClick={() => onEditSection('personal-info')}>
            Tax Information
          </button>
          <div className="ob-review-grid ob-review-grid-3">
            <div>
              <p className="ob-review-label">First Name</p>
              <p className="ob-review-value">{formData.firstName}</p>
            </div>
            <div>
              <p className="ob-review-label">Middle Name</p>
              <p className="ob-review-value">—</p>
            </div>
            <div>
              <p className="ob-review-label">Last Name</p>
              <p className="ob-review-value">{formData.lastName}</p>
            </div>
          </div>
          <div className="ob-review-grid" style={{ marginTop: '0.75rem' }}>
            <div>
              <p className="ob-review-label">Date of Birth</p>
              <p className="ob-review-value">06/15/1988</p>
            </div>
          </div>
          <div className="ob-review-ein-row">
            <div>
              <p className="ob-review-label">EIN</p>
              <p className="ob-review-value">{einVisible ? '12-3454567' : '*****4567'}</p>
            </div>
            <button
              className="ob-ein-toggle"
              onClick={() => setEinVisible(!einVisible)}
              aria-label={einVisible ? 'Hide EIN' : 'Show EIN'}
            >
              {einVisible ? '🙈' : '👁'}
            </button>
          </div>
          <hr className="ob-review-divider" />
        </section>

        <section className="ob-review-section">
          <button className="ob-review-section-title" onClick={() => onEditSection('location')}>
            Location
          </button>
          <div>
            <p className="ob-review-label">Address</p>
            <p className="ob-review-value">{formData.address}</p>
          </div>
          <div className="ob-review-grid ob-review-grid-3" style={{ marginTop: '0.75rem' }}>
            <div>
              <p className="ob-review-label">City</p>
              <p className="ob-review-value">{formData.city}</p>
            </div>
            <div>
              <p className="ob-review-label">State</p>
              <p className="ob-review-value ob-review-link">TX</p>
            </div>
            <div>
              <p className="ob-review-label">Zip</p>
              <p className="ob-review-value">{formData.zipCode}</p>
            </div>
          </div>
        </section>
      </div>
    </OnboardingLayout>
  )
}
