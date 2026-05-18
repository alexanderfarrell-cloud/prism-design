import { useState } from 'react'
import { ModusWcBadge, ModusWcIcon } from '@trimble-oss/moduswebcomponents-react'

type VendorStatus = 'Preferred' | 'Active' | 'Inactive' | 'Draft'
type VendorCategory = 'Structural' | 'Concrete' | 'Electrical' | 'Mechanical' | 'Excavation' | 'Finishing' | 'General'

interface Vendor {
  id: string
  name: string
  specialty: string
  category: VendorCategory
  city: string
  state: string
  contact: string
  phone: string
  email: string
  activeJobs: number
  ytdSpend: number
  status: VendorStatus
  rating: number
  certifications: string[]
}

const VENDORS: Vendor[] = [
  {
    id: 'VND-001',
    name: 'AllSteel Fabricators',
    specialty: 'Structural Steel & Ironwork',
    category: 'Structural',
    city: 'Portland',
    state: 'OR',
    contact: 'Mike Sorenson',
    phone: '(503) 555-0701',
    email: 'msorenson@allsteel.com',
    activeJobs: 3,
    ytdSpend: 284_500,
    status: 'Preferred',
    rating: 5,
    certifications: ['AISC Certified', 'AWS D1.1'],
  },
  {
    id: 'VND-002',
    name: 'Premier Concrete Supply',
    specialty: 'Ready-Mix Concrete & Masonry',
    category: 'Concrete',
    city: 'Seattle',
    state: 'WA',
    contact: 'Dana Kwon',
    phone: '(206) 555-0842',
    email: 'dkwon@premierconcrete.com',
    activeJobs: 2,
    ytdSpend: 137_200,
    status: 'Active',
    rating: 4,
    certifications: ['NRMCA Member'],
  },
  {
    id: 'VND-003',
    name: 'Cascade Electrical',
    specialty: 'Commercial Electrical Systems',
    category: 'Electrical',
    city: 'Portland',
    state: 'OR',
    contact: 'Steve Albright',
    phone: '(503) 555-0913',
    email: 'salbright@cascadeelec.com',
    activeJobs: 2,
    ytdSpend: 198_400,
    status: 'Active',
    rating: 4,
    certifications: ['NECA', 'IBEW Local 48'],
  },
  {
    id: 'VND-004',
    name: 'Pacific NW Mechanical',
    specialty: 'Plumbing, HVAC & Piping',
    category: 'Mechanical',
    city: 'Tacoma',
    state: 'WA',
    contact: 'Rosa Gutierrez',
    phone: '(253) 555-1044',
    email: 'rgutierrez@pnwmech.com',
    activeJobs: 1,
    ytdSpend: 118_000,
    status: 'Preferred',
    rating: 5,
    certifications: ['UA Local 26', 'WA Licensed Contractor'],
  },
  {
    id: 'VND-005',
    name: 'Olympic Earthworks',
    specialty: 'Excavation & Site Prep',
    category: 'Excavation',
    city: 'Olympia',
    state: 'WA',
    contact: 'Chris Barber',
    phone: '(360) 555-1165',
    email: 'cbarber@olympicearth.com',
    activeJobs: 1,
    ytdSpend: 67_300,
    status: 'Active',
    rating: 3,
    certifications: ['WSDOT Pre-Qualified'],
  },
  {
    id: 'VND-006',
    name: 'Cascade Interiors',
    specialty: 'Drywall, Paint & Finishing',
    category: 'Finishing',
    city: 'Portland',
    state: 'OR',
    contact: 'Kim Fletcher',
    phone: '(503) 555-1276',
    email: 'kfletcher@cascadeinteriors.com',
    activeJobs: 0,
    ytdSpend: 0,
    status: 'Inactive',
    rating: 3,
    certifications: [],
  },
  {
    id: 'VND-007',
    name: 'Bridge & Heavy Civil Inc.',
    specialty: 'Heavy Civil & Bridge Construction',
    category: 'General',
    city: 'Bend',
    state: 'OR',
    contact: 'Tom Farrell',
    phone: '(541) 555-1387',
    email: 'tfarrell@bridgeheavy.com',
    activeJobs: 1,
    ytdSpend: 210_000,
    status: 'Active',
    rating: 4,
    certifications: ['ODOT Pre-Qualified', 'ACI Certified'],
  },
  {
    id: 'VND-008',
    name: 'NW Roofing Solutions',
    specialty: 'Commercial & Industrial Roofing',
    category: 'Finishing',
    city: 'Salem',
    state: 'OR',
    contact: 'Pat Nguyen',
    phone: '(503) 555-1498',
    email: 'pnguyen@nwroofing.com',
    activeJobs: 0,
    ytdSpend: 0,
    status: 'Draft',
    rating: 0,
    certifications: [],
  },
  {
    id: 'VND-009',
    name: 'Greenline Civil Contractors',
    specialty: 'Utilities & Underground Infrastructure',
    category: 'General',
    city: 'Portland',
    state: 'OR',
    contact: 'Mia Castellano',
    phone: '(503) 555-1509',
    email: 'mcastellano@greenlinecivil.com',
    activeJobs: 0,
    ytdSpend: 0,
    status: 'Draft',
    rating: 0,
    certifications: [],
  },
]

const STATUS_COLOR: Record<VendorStatus, 'primary' | 'success' | 'secondary' | 'warning'> = {
  Preferred: 'primary',
  Active: 'success',
  Inactive: 'secondary',
  Draft: 'warning',
}

type VendorTab = 'All' | 'Preferred' | 'Active' | 'Inactive' | 'Draft'
const VENDOR_TABS: VendorTab[] = ['All', 'Preferred', 'Active', 'Draft', 'Inactive']

const CATEGORIES: Array<VendorCategory | 'All'> = [
  'All', 'Structural', 'Concrete', 'Electrical', 'Mechanical', 'Excavation', 'Finishing', 'General',
]

function fmt(n: number) {
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`
}

function RatingStars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: '0.7rem',
            color: i < rating ? '#fbad26' : 'var(--modus-wc-color-base-300)',
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function VendorHub() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<VendorCategory | 'All'>('All')
  const [activeTab, setActiveTab] = useState<VendorTab>('All')

  const filtered = VENDORS.filter((v) => {
    const matchesTab = activeTab === 'All' || v.status === activeTab
    const matchesSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.specialty.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || v.category === activeCategory
    return matchesTab && matchesSearch && matchesCategory
  })

  const tabCount: Record<VendorTab, number> = {
    All: VENDORS.length,
    Preferred: VENDORS.filter((v) => v.status === 'Preferred').length,
    Active: VENDORS.filter((v) => v.status === 'Active').length,
    Inactive: VENDORS.filter((v) => v.status === 'Inactive').length,
    Draft: VENDORS.filter((v) => v.status === 'Draft').length,
  }

  const activeCount = VENDORS.filter((v) => v.status === 'Active' || v.status === 'Preferred').length
  const preferredCount = VENDORS.filter((v) => v.status === 'Preferred').length
  const totalYtdSpend = VENDORS.reduce((s, v) => s + v.ytdSpend, 0)

  return (
    <div className="hub-page">
      {/* Header */}
      <h1 className="hub-title">
        <ModusWcIcon name="business" size="md" decorative />
        Vendors
      </h1>

      {/* KPI row */}
      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">Total Vendors</span>
          <span className="kpi-value">{VENDORS.length}</span>
          <span className="kpi-sub">{activeCount} active</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Preferred</span>
          <span className="kpi-value kpi-value--primary">{preferredCount}</span>
          <span className="kpi-sub">Top-rated vendors</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">YTD Spend</span>
          <span className="kpi-value">{fmt(totalYtdSpend)}</span>
          <span className="kpi-sub">Across all vendors</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Active on Jobs</span>
          <span className="kpi-value kpi-value--success">
            {VENDORS.filter((v) => v.activeJobs > 0).length}
          </span>
          <span className="kpi-sub">Currently deployed</span>
        </div>
      </div>

      {/* Status tabs */}
      <div className="tab-bar">
        {VENDOR_TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? ' tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className={`tab-count${activeTab === tab ? ' tab-count--active' : ''}`}>
              {tabCount[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Search input — full width */}
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'flex', pointerEvents: 'none',
          }}>
            <ModusWcIcon name="search" size="sm" decorative />
          </span>
          <input
            type="text"
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '0.5rem 0.75rem 0.5rem 2rem',
              border: '1px solid var(--modus-wc-color-base-200)', borderRadius: 6,
              fontFamily: 'Open Sans, sans-serif', fontSize: '0.875rem',
              background: 'var(--modus-wc-color-base-page)', color: 'var(--modus-wc-color-base-content)',
              outline: 'none',
            }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', paddingTop: '8px', paddingBottom: '8px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '4px 12px', borderRadius: 99,
                border: activeCategory === cat
                  ? '1px solid var(--modus-wc-color-primary)'
                  : '1px solid var(--modus-wc-color-base-200)',
                background: activeCategory === cat ? 'var(--modus-wc-color-primary)' : 'var(--modus-wc-color-base-100)',
                color: activeCategory === cat ? '#fff' : 'var(--modus-wc-color-base-content)',
                fontFamily: 'Open Sans, sans-serif', fontSize: '0.75rem',
                fontWeight: activeCategory === cat ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor card grid */}
      {filtered.length > 0 ? (
        <div className="card-grid">
          {filtered.map((vendor) => (
            <div key={vendor.id} className="vendor-card">
              {/* Card header */}
              <div className="vendor-card-header">
                <div>
                  <div className="vendor-card-name">{vendor.name}</div>
                  <div className="vendor-card-specialty">{vendor.specialty}</div>
                </div>
                <ModusWcBadge color={STATUS_COLOR[vendor.status]} size="sm" text={vendor.status} />
              </div>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RatingStars rating={vendor.rating} />
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>{vendor.rating}/5</span>
              </div>

              {/* Meta */}
              <div className="vendor-card-meta">
                <div className="vendor-card-row">
                  <ModusWcIcon name="location" size="sm" decorative />
                  {vendor.city}, {vendor.state}
                </div>
                <div className="vendor-card-row">
                  <ModusWcIcon name="person" size="sm" decorative />
                  {vendor.contact}
                </div>
                <div className="vendor-card-row">
                  <ModusWcIcon name="phone" size="sm" decorative />
                  {vendor.phone}
                </div>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--modus-wc-color-base-200)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="kpi-label">Active Jobs</span>
                  <span className="text-body text-strong">{vendor.activeJobs}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="kpi-label">YTD Spend</span>
                  <span className="text-body text-strong">
                    {vendor.ytdSpend > 0 ? fmt(vendor.ytdSpend) : '—'}
                  </span>
                </div>
                {vendor.certifications.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span className="kpi-label">Certs</span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {vendor.certifications.map((cert) => (
                        <span
                          key={cert}
                          style={{
                            fontSize: '0.62rem',
                            padding: '1px 6px',
                            borderRadius: 3,
                            background: 'var(--modus-wc-color-base-200)',
                            color: 'var(--modus-wc-color-base-content-low-contrast)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ModusWcIcon name="business" size="lg" decorative />
          <span>No vendors match your search</span>
        </div>
      )}
    </div>
  )
}
