import React, { useState, useEffect, useRef } from 'react'
import { ModusWcBadge, ModusWcIcon } from '@trimble-oss/moduswebcomponents-react'

type InvoiceStatus = 'Overdue' | 'Pending' | 'Approved' | 'Paid' | 'Draft'

interface Invoice {
  id: string
  jobName: string
  jobId: string
  customer: string
  amount: number
  dueDate: string
  issuedDate: string
  status: InvoiceStatus
}

export const INVOICES: Invoice[] = [
  {
    id: 'INV-2025-0142',
    jobName: 'Downtown Tower — Phase 2',
    jobId: 'PRJ-2024-0051',
    customer: 'Meridian Construction Group',
    amount: 234_500,
    dueDate: 'May 15, 2025',
    issuedDate: 'Apr 15, 2025',
    status: 'Overdue',
  },
  {
    id: 'INV-2025-0141',
    jobName: 'Highway 89 Bridge Expansion',
    jobId: 'PRJ-2024-0048',
    customer: 'State Dept. of Transportation',
    amount: 580_000,
    dueDate: 'May 20, 2025',
    issuedDate: 'Apr 20, 2025',
    status: 'Pending',
  },
  {
    id: 'INV-2025-0140',
    jobName: 'Lakeside Residential Complex',
    jobId: 'PRJ-2024-0044',
    customer: 'Summit Development Corp',
    amount: 95_000,
    dueDate: 'May 25, 2025',
    issuedDate: 'Apr 25, 2025',
    status: 'Approved',
  },
  {
    id: 'INV-2025-0139',
    jobName: 'Airport Terminal Renovation',
    jobId: 'PRJ-2023-0038',
    customer: 'Regional Airport Authority',
    amount: 1_240_000,
    dueDate: 'Apr 30, 2025',
    issuedDate: 'Mar 30, 2025',
    status: 'Paid',
  },
  {
    id: 'INV-2025-0138',
    jobName: 'Industrial Park — Phase 1',
    jobId: 'PRJ-2023-0031',
    customer: 'Pacific Industrial LLC',
    amount: 450_000,
    dueDate: 'Apr 15, 2025',
    issuedDate: 'Mar 15, 2025',
    status: 'Paid',
  },
  {
    id: 'INV-2025-0137',
    jobName: 'Highway 89 Bridge Expansion',
    jobId: 'PRJ-2024-0048',
    customer: 'State Dept. of Transportation',
    amount: 320_000,
    dueDate: 'Jun 1, 2025',
    issuedDate: 'May 1, 2025',
    status: 'Overdue',
  },
  {
    id: 'INV-2025-0135',
    jobName: 'Lakeside Residential Complex',
    jobId: 'PRJ-2024-0044',
    customer: 'Summit Development Corp',
    amount: 42_500,
    dueDate: 'Jun 15, 2025',
    issuedDate: 'May 14, 2025',
    status: 'Pending',
  },
  {
    id: 'INV-2025-0136',
    jobName: 'Airport Terminal Renovation',
    jobId: 'PRJ-2023-0038',
    customer: 'Regional Airport Authority',
    amount: 875_000,
    dueDate: 'Mar 31, 2025',
    issuedDate: 'Feb 28, 2025',
    status: 'Paid',
  },
]

const STATUS_COLOR: Record<InvoiceStatus, 'danger' | 'warning' | 'primary' | 'success' | 'secondary'> = {
  Overdue: 'danger',
  Pending: 'warning',
  Approved: 'primary',
  Paid: 'success',
  Draft: 'secondary',
}

type Tab = 'All' | 'Pending' | 'Overdue' | 'Paid' | 'Draft'
const TABS: Tab[] = ['All', 'Pending', 'Overdue', 'Paid', 'Draft']

const TAB_FILTER: Record<Tab, (i: Invoice) => boolean> = {
  All: () => true,
  Pending: (i) => i.status === 'Pending' || i.status === 'Approved',
  Overdue: (i) => i.status === 'Overdue',
  Paid: (i) => i.status === 'Paid',
  Draft: (i) => i.status === 'Draft',
}

type SortKey = 'due-desc' | 'due-asc' | 'issued-desc' | 'amount-desc' | 'amount-asc' | 'job-az' | 'customer-az'

function fmt(n: number) {
  return '$' + n.toLocaleString()
}

function parseDateMs(d: string): number {
  return new Date(d).getTime()
}

const STATUS_STRIP: Record<InvoiceStatus, string> = {
  Overdue:  'var(--modus-wc-color-danger, #da212c)',
  Pending:  'var(--modus-wc-color-warning, #fbad26)',
  Approved: 'var(--modus-wc-color-primary)',
  Paid:     'var(--modus-wc-color-success, #006638)',
  Draft:    'var(--modus-wc-color-base-300, #b0b8c1)',
}


function InvoiceCardMenu({ invoiceId, open, onOpen, onClose }: {
  invoiceId: string; open: boolean; onOpen: () => void; onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        aria-label="More options"
        onClick={(e) => { e.stopPropagation(); open ? onClose() : onOpen() }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: 'var(--modus-wc-color-base-content-low-contrast)' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--modus-wc-color-base-100)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      >
        {[0,1,2].map((i) => <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', display: 'block' }} />)}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, background: 'var(--modus-wc-color-base-page)', border: '1px solid var(--modus-wc-color-base-200)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', minWidth: 160, overflow: 'hidden', marginTop: 4 }}>
          <button
            onClick={() => onClose()}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content)', textAlign: 'left' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--modus-wc-color-base-100)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <ModusWcIcon name="check_circle" size="xs" decorative style={{ color: 'var(--modus-wc-color-success, #006638)' } as React.CSSProperties} />
            Mark as Collected
          </button>
        </div>
      )}
    </div>
  )
}

export default function BillingHub() {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('due-desc')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filtered = INVOICES
    .filter(TAB_FILTER[activeTab])
    .filter((i) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        i.jobName.toLowerCase().includes(q) ||
        i.customer.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.jobId.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'due-desc':    return parseDateMs(b.dueDate) - parseDateMs(a.dueDate)
        case 'due-asc':     return parseDateMs(a.dueDate) - parseDateMs(b.dueDate)
        case 'issued-desc': return parseDateMs(b.issuedDate) - parseDateMs(a.issuedDate)
        case 'amount-desc': return b.amount - a.amount
        case 'amount-asc':  return a.amount - b.amount
        case 'job-az':      return a.jobName.localeCompare(b.jobName)
        case 'customer-az': return a.customer.localeCompare(b.customer)
      }
    })


  const totalBilled = INVOICES.reduce((s, i) => s + i.amount, 0)
  const outstanding = INVOICES.filter((i) => ['Overdue', 'Pending', 'Approved'].includes(i.status))
    .reduce((s, i) => s + i.amount, 0)
  const overdue = INVOICES.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0)
  const paid = INVOICES.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)

  const tabCount: Record<Tab, number> = {
    All: INVOICES.length,
    Pending: INVOICES.filter(TAB_FILTER.Pending).length,
    Overdue: INVOICES.filter(TAB_FILTER.Overdue).length,
    Paid: INVOICES.filter(TAB_FILTER.Paid).length,
    Draft: INVOICES.filter(TAB_FILTER.Draft).length,
  }

  return (
    <div className="hub-page">
      {/* Header */}
      <h1 className="hub-title">
        <ModusWcIcon name="receipt" size="md" decorative />
        Billing
      </h1>

      {/* KPI summary */}
      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">Total Invoiced</span>
          <span className="kpi-value">${(totalBilled / 1_000_000).toFixed(2)}M</span>
          <span className="kpi-sub">{INVOICES.length} invoices</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Outstanding</span>
          <span className="kpi-value kpi-value--warning">${(outstanding / 1_000_000).toFixed(2)}M</span>
          <span className="kpi-sub">
            {INVOICES.filter((i) => ['Overdue', 'Pending', 'Approved'].includes(i.status)).length} invoices
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Overdue</span>
          <span className="kpi-value kpi-value--danger">{fmt(overdue)}</span>
          <span className="kpi-sub">
            {INVOICES.filter((i) => i.status === 'Overdue').length} invoice(s) past due
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Collected</span>
          <span className="kpi-value kpi-value--success">${(paid / 1_000_000).toFixed(2)}M</span>
          <span className="kpi-sub">
            {INVOICES.filter((i) => i.status === 'Paid').length} invoices paid
          </span>
        </div>
      </div>

      {/* Invoice list panel */}
      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Tabs */}
        <div className="tab-bar">
          {TABS.map((tab) => (
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

        {/* Search + sort toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--modus-wc-color-base-200)',
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <ModusWcIcon
              name="search"
              size="xs"
              decorative
              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--modus-wc-color-base-content-low-contrast)', pointerEvents: 'none' } as React.CSSProperties}
            />
            <input
              type="text"
              placeholder="Search job, customer, or invoice ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: 28, paddingRight: 8, paddingTop: 5, paddingBottom: 5,
                fontSize: '0.8125rem', border: '1px solid var(--modus-wc-color-base-300)',
                borderRadius: 4, background: 'var(--modus-wc-color-base-page)',
                color: 'var(--modus-wc-color-base-content)', fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="Sort invoices"
            style={{
              fontSize: '0.8125rem', padding: '5px 8px', border: '1px solid var(--modus-wc-color-base-300)',
              borderRadius: 4, background: 'var(--modus-wc-color-base-page)',
              color: 'var(--modus-wc-color-base-content)', fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <option value="due-desc">Due date (newest)</option>
            <option value="due-asc">Due date (oldest)</option>
            <option value="issued-desc">Issued (newest)</option>
            <option value="amount-desc">Amount (high–low)</option>
            <option value="amount-asc">Amount (low–high)</option>
            <option value="job-az">Job (A–Z)</option>
            <option value="customer-az">Customer (A–Z)</option>
          </select>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem', gap: '0.5rem' }}>
            {filtered.length === 0 && (
              <div className="empty-state">
                <ModusWcIcon name="receipt" size="lg" decorative />
                <span>{search ? 'No invoices match your search' : 'No invoices in this category'}</span>
              </div>
            )}
            {filtered.map((inv) => {
              const isOverdue = inv.status === 'Overdue'
              return (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 0.75rem', borderRadius: 6,
                    border: `1px solid ${isOverdue ? 'var(--modus-wc-color-danger, #da212c)' : 'var(--modus-wc-color-base-200)'}`,
                    background: 'var(--modus-wc-color-base-page)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--modus-wc-color-base-content)' }}>
                          {inv.jobName}
                        </span>
                        <span className="text-muted">{inv.id} · Issued {inv.issuedDate}</span>
                      </div>
                      <InvoiceCardMenu
                        invoiceId={inv.id}
                        open={openMenuId === inv.id}
                        onOpen={() => setOpenMenuId(inv.id)}
                        onClose={() => setOpenMenuId(null)}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className="text-muted">{inv.customer}</span>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: isOverdue ? 700 : 400,
                          color: isOverdue ? 'var(--modus-wc-color-danger, #da212c)' : 'var(--modus-wc-color-base-content-low-contrast)',
                        }}>
                          {isOverdue ? '⚠ ' : ''}Due {inv.dueDate}
                        </span>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--modus-wc-color-base-content)', whiteSpace: 'nowrap' }}>
                        {fmt(inv.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
      </div>
    </div>
  )
}
