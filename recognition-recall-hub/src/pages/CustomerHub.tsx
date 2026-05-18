import { useState, useEffect, useRef } from 'react'
import { ModusWcBadge, ModusWcIcon } from '@trimble-oss/moduswebcomponents-react'

type CustomerType = 'General Contractor' | 'Government' | 'Developer' | 'Owner'
type CustomerStatus = 'Active' | 'Draft'

interface LinkedJob {
  id: string
  name: string
  status: string
  contractValue: number
}

interface Customer {
  id: string
  name: string
  type: CustomerType
  status: CustomerStatus
  contact: string
  title: string
  email: string
  phone: string
  city: string
  activeJobs: number
  totalContractValue: number
  ytdBilled: number
  jobs: LinkedJob[]
}

const CUSTOMERS: Customer[] = [
  {
    id: 'CUS-001',
    name: 'Meridian Construction Group',
    type: 'General Contractor',
    status: 'Active',
    contact: 'David Park',
    title: 'VP of Finance',
    email: 'dpark@meridian-cg.com',
    phone: '(503) 555-0182',
    city: 'Portland, OR',
    activeJobs: 3,
    totalContractValue: 14_500_000,
    ytdBilled: 3_024_000,
    jobs: [
      { id: 'PRJ-2024-0051', name: 'Downtown Tower — Phase 2', status: 'Active', contractValue: 4_200_000 },
      { id: 'PRJ-2023-0027', name: 'Pearl District Lofts', status: 'Completed', contractValue: 3_800_000 },
      { id: 'PRJ-2025-0061', name: 'Eastside Mixed-Use', status: 'Active', contractValue: 6_500_000 },
    ],
  },
  {
    id: 'CUS-002',
    name: 'State Dept. of Transportation',
    type: 'Government',
    status: 'Active',
    contact: 'Lisa Nakamura',
    title: 'Project Director',
    email: 'lnakamura@odot.state.or.us',
    phone: '(503) 986-3400',
    city: 'Salem, OR',
    activeJobs: 1,
    totalContractValue: 8_500_000,
    ytdBilled: 3_400_000,
    jobs: [
      { id: 'PRJ-2024-0048', name: 'Highway 89 Bridge Expansion', status: 'Active', contractValue: 8_500_000 },
    ],
  },
  {
    id: 'CUS-003',
    name: 'Summit Development Corp',
    type: 'Developer',
    status: 'Active',
    contact: 'Rachel Thompson',
    title: 'Development Manager',
    email: 'rthompson@summitdev.com',
    phone: '(503) 555-0244',
    city: 'Lake Oswego, OR',
    activeJobs: 2,
    totalContractValue: 7_300_000,
    ytdBilled: 630_000,
    jobs: [
      { id: 'PRJ-2024-0044', name: 'Lakeside Residential Complex', status: 'On Hold', contractValue: 2_100_000 },
      { id: 'PRJ-2025-0058', name: 'Summit Ridge Townhomes', status: 'Active', contractValue: 5_200_000 },
    ],
  },
  {
    id: 'CUS-004',
    name: 'Regional Airport Authority',
    type: 'Government',
    status: 'Active',
    contact: 'Greg Halvorsen',
    title: 'Capital Projects Manager',
    email: 'ghalvorsen@raa.gov',
    phone: '(503) 555-0315',
    city: 'Hillsboro, OR',
    activeJobs: 1,
    totalContractValue: 12_300_000,
    ytdBilled: 9_225_000,
    jobs: [
      { id: 'PRJ-2023-0038', name: 'Airport Terminal Renovation', status: 'Active', contractValue: 12_300_000 },
    ],
  },
  {
    id: 'CUS-005',
    name: 'Pacific Industrial LLC',
    type: 'Owner',
    status: 'Active',
    contact: 'Tony Reeves',
    title: 'Facilities Director',
    email: 'treeves@pacindustrial.com',
    phone: '(503) 555-0421',
    city: 'Tualatin, OR',
    activeJobs: 0,
    totalContractValue: 5_800_000,
    ytdBilled: 5_800_000,
    jobs: [
      { id: 'PRJ-2023-0031', name: 'Industrial Park — Phase 1', status: 'Completed', contractValue: 5_800_000 },
    ],
  },
  {
    id: 'CUS-006',
    name: 'Cascadia Health Systems',
    type: 'Owner',
    status: 'Draft',
    contact: 'Amanda Hsu',
    title: 'Director of Facilities',
    email: 'ahsu@cascadiahealth.org',
    phone: '(503) 555-0537',
    city: 'Portland, OR',
    activeJobs: 0,
    totalContractValue: 0,
    ytdBilled: 0,
    jobs: [],
  },
  {
    id: 'CUS-007',
    name: 'Metro Transit Authority',
    type: 'Government',
    status: 'Draft',
    contact: 'James Olara',
    title: 'Capital Planning Lead',
    email: 'jolara@metrota.gov',
    phone: '(503) 555-0648',
    city: 'Portland, OR',
    activeJobs: 0,
    totalContractValue: 0,
    ytdBilled: 0,
    jobs: [],
  },
]

const TYPE_COLOR: Record<CustomerType, 'primary' | 'secondary' | 'success' | 'warning'> = {
  'General Contractor': 'primary',
  Government: 'secondary',
  Developer: 'success',
  Owner: 'warning',
}

const STATUS_COLOR: Record<CustomerStatus, 'success' | 'warning'> = {
  Active: 'success',
  Draft: 'warning',
}

type CustTab = 'All' | 'Active' | 'Draft'
const CUST_TABS: CustTab[] = ['All', 'Active', 'Draft']

const TYPES: Array<CustomerType | 'All'> = [
  'All', 'General Contractor', 'Government', 'Developer', 'Owner',
]

function fmt(n: number) {
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`
}

const CUSTOMER_MENU_ITEMS = [
  { label: 'Edit Details',       color: 'var(--modus-wc-color-base-content)' },
  { label: 'Add Contact',        color: 'var(--modus-wc-color-base-content)' },
  { label: 'Mark as Active',     color: 'var(--modus-wc-color-success, #006638)' },
  { label: 'Archive',            color: 'var(--modus-wc-color-danger, #da212c)' },
]

function CustomerCardMenu({ customerId }: { customerId: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        aria-label="Card menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '2px 4px', borderRadius: 4, display: 'flex', alignItems: 'center',
          color: 'var(--modus-wc-color-base-content-low-contrast)',
        }}
      >
        <ModusWcIcon name="menu" size="sm" decorative />
      </button>
      {menuOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0,
            zIndex: 100, background: 'var(--modus-wc-color-base-page)',
            border: '1px solid var(--modus-wc-color-base-200)',
            borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            padding: '0.375rem 0', minWidth: 200,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {CUSTOMER_MENU_ITEMS.map(({ label, color }) => (
            <button
              key={label}
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.55rem 1rem', textAlign: 'left',
                fontFamily: 'Open Sans, sans-serif', fontSize: '0.875rem',
                color, fontWeight: 400, transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--modus-wc-color-base-100)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CustomerHub() {
  const [activeTab, setActiveTab]   = useState<CustTab>('All')
  const [activeType, setActiveType] = useState<CustomerType | 'All'>('All')
  const [search, setSearch]         = useState('')

  const filtered = CUSTOMERS.filter((c) => {
    const matchesTab  = activeTab === 'All' || c.status === activeTab
    const matchesType = activeType === 'All' || c.type === activeType
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesType && matchesSearch
  })

  const tabCount: Record<CustTab, number> = {
    All: CUSTOMERS.length,
    Active: CUSTOMERS.filter((c) => c.status === 'Active').length,
    Draft: CUSTOMERS.filter((c) => c.status === 'Draft').length,
  }

  const activeCustomers   = CUSTOMERS.filter((c) => c.status === 'Active')
  const totalContractVal  = activeCustomers.reduce((s, c) => s + c.totalContractValue, 0)
  const totalYtdBilled    = activeCustomers.reduce((s, c) => s + c.ytdBilled, 0)
  const totalActiveJobs   = activeCustomers.reduce((s, c) => s + c.activeJobs, 0)

  return (
    <div className="hub-page">
      {/* Header */}
      <h1 className="hub-title">
        <ModusWcIcon name="contacts" size="md" decorative />
        Customers
      </h1>

      {/* KPI row */}
      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">Total Customers</span>
          <span className="kpi-value">{CUSTOMERS.length}</span>
          <span className="kpi-sub">{activeCustomers.length} active</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Contract Value</span>
          <span className="kpi-value">${(totalContractVal / 1_000_000).toFixed(1)}M</span>
          <span className="kpi-sub">Across active customers</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Billed YTD</span>
          <span className="kpi-value kpi-value--success">${(totalYtdBilled / 1_000_000).toFixed(1)}M</span>
          <span className="kpi-sub">{Math.round((totalYtdBilled / totalContractVal) * 100)}% of contract</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Active Jobs</span>
          <span className="kpi-value kpi-value--primary">{totalActiveJobs}</span>
          <span className="kpi-sub">Across all customers</span>
        </div>
      </div>

      {/* Status tabs */}
      <div className="tab-bar">
        {CUST_TABS.map((tab) => (
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

      {/* Search + type filter pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'flex', pointerEvents: 'none',
          }}>
            <ModusWcIcon name="search" size="sm" decorative />
          </span>
          <input
            type="text"
            placeholder="Search customers…"
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

        {/* Type pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', paddingTop: '8px', paddingBottom: '8px' }}>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              style={{
                padding: '4px 12px', borderRadius: 99,
                border: activeType === t
                  ? '1px solid var(--modus-wc-color-primary)'
                  : '1px solid var(--modus-wc-color-base-200)',
                background: activeType === t ? 'var(--modus-wc-color-primary)' : 'var(--modus-wc-color-base-100)',
                color: activeType === t ? '#fff' : 'var(--modus-wc-color-base-content)',
                fontFamily: 'Open Sans, sans-serif', fontSize: '0.75rem',
                fontWeight: activeType === t ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Customer card grid */}
      {filtered.length > 0 ? (
        <div className="card-grid">
          {filtered.map((c) => (
            <div key={c.id} className="vendor-card">
              {/* Card header */}
              <div className="vendor-card-header">
                <div style={{ minWidth: 0 }}>
                  <div className="vendor-card-name">{c.name}</div>
                  <div className="vendor-card-specialty">{c.city}</div>
                </div>
                <CustomerCardMenu customerId={c.id} />
              </div>

              {/* Contact info */}
              <div className="vendor-card-meta">
                <div className="vendor-card-row">
                  <ModusWcIcon name="person" size="sm" decorative />
                  {c.contact} · {c.title}
                </div>
                <div className="vendor-card-row">
                  <ModusWcIcon name="email" size="sm" decorative />
                  {c.email}
                </div>
                <div className="vendor-card-row">
                  <ModusWcIcon name="phone" size="sm" decorative />
                  {c.phone}
                </div>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex', gap: '1rem', paddingTop: '0.5rem',
                borderTop: '1px solid var(--modus-wc-color-base-200)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="kpi-label">Active Jobs</span>
                  <span className="text-body text-strong">{c.activeJobs}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="kpi-label">Contract Value</span>
                  <span className="text-body text-strong">{c.totalContractValue > 0 ? fmt(c.totalContractValue) : '—'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="kpi-label">Billed YTD</span>
                  <span className="text-body text-strong">{c.ytdBilled > 0 ? fmt(c.ytdBilled) : '—'}</span>
                </div>
              </div>

              {/* Jobs list (if any) */}
              {c.jobs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: '0.25rem' }}>
                  <span className="kpi-label">Jobs</span>
                  {c.jobs.map((job) => (
                    <div key={job.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{
                        fontSize: '0.72rem', color: 'var(--modus-wc-color-base-content)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {job.name}
                      </span>
                      <ModusWcBadge
                        color={job.status === 'Active' ? 'success' : job.status === 'On Hold' ? 'warning' : 'secondary'}
                        size="sm"
                        text={job.status}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ModusWcIcon name="contacts" size="lg" decorative />
          <span>No customers match your search</span>
        </div>
      )}
    </div>
  )
}
