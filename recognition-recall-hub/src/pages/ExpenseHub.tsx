import React, { useState } from 'react'
import { ModusWcBadge, ModusWcIcon } from '@trimble-oss/moduswebcomponents-react'

type ExpenseStatus = 'Approved' | 'Pending' | 'Rejected' | 'Draft'
type ExpenseCategory = 'Labor' | 'Materials' | 'Equipment' | 'Subcontractor' | 'Travel' | 'Other'

interface Expense {
  id: string
  date: string
  description: string
  jobId: string
  jobName: string
  category: ExpenseCategory
  amount: number
  submittedBy: string
  status: ExpenseStatus
}

export const EXPENSES: Expense[] = [
  {
    id: 'EXP-2025-0312',
    date: 'May 2, 2025',
    description: 'Structural steel delivery — downtown site',
    jobId: 'PRJ-2024-0051',
    jobName: 'Downtown Tower — Phase 2',
    category: 'Materials',
    amount: 84_500,
    submittedBy: 'Sarah Chen',
    status: 'Approved',
  },
  {
    id: 'EXP-2025-0311',
    date: 'May 1, 2025',
    description: 'Concrete pour — bridge deck phase 3',
    jobId: 'PRJ-2024-0048',
    jobName: 'Highway 89 Bridge Expansion',
    category: 'Subcontractor',
    amount: 52_300,
    submittedBy: 'Marcus Rivera',
    status: 'Pending',
  },
  {
    id: 'EXP-2025-0310',
    date: 'Apr 30, 2025',
    description: 'Crane rental — tower crane May-Jun',
    jobId: 'PRJ-2024-0051',
    jobName: 'Downtown Tower — Phase 2',
    category: 'Equipment',
    amount: 18_900,
    submittedBy: 'Sarah Chen',
    status: 'Approved',
  },
  {
    id: 'EXP-2025-0309',
    date: 'Apr 29, 2025',
    description: 'Electricians — terminal gate A rewire',
    jobId: 'PRJ-2023-0038',
    jobName: 'Airport Terminal Renovation',
    category: 'Labor',
    amount: 34_200,
    submittedBy: 'Sarah Chen',
    status: 'Approved',
  },
  {
    id: 'EXP-2025-0308',
    date: 'Apr 28, 2025',
    description: 'Site survey travel — Salem',
    jobId: 'PRJ-2024-0048',
    jobName: 'Highway 89 Bridge Expansion',
    category: 'Travel',
    amount: 1_420,
    submittedBy: 'Marcus Rivera',
    status: 'Approved',
  },
  {
    id: 'EXP-2025-0307',
    date: 'Apr 25, 2025',
    description: 'Drywall & insulation — residential units',
    jobId: 'PRJ-2024-0044',
    jobName: 'Lakeside Residential Complex',
    category: 'Materials',
    amount: 29_800,
    submittedBy: 'Jamie Torres',
    status: 'Rejected',
  },
  {
    id: 'EXP-2025-0306',
    date: 'Apr 22, 2025',
    description: 'Permits & inspection fees — May',
    jobId: 'PRJ-2024-0051',
    jobName: 'Downtown Tower — Phase 2',
    category: 'Other',
    amount: 4_750,
    submittedBy: 'Sarah Chen',
    status: 'Draft',
  },
  {
    id: 'EXP-2025-0305',
    date: 'Apr 21, 2025',
    description: 'HVAC subcontractor — terminal C',
    jobId: 'PRJ-2023-0038',
    jobName: 'Airport Terminal Renovation',
    category: 'Subcontractor',
    amount: 118_000,
    submittedBy: 'Derek Yamamoto',
    status: 'Pending',
  },
]

const STATUS_COLOR: Record<ExpenseStatus, 'success' | 'warning' | 'danger' | 'secondary'> = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'danger',
  Draft: 'secondary',
}

const CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  Labor: 'var(--modus-wc-color-primary)',
  Materials: '#7c5cbf',
  Equipment: '#e07b16',
  Subcontractor: '#006638',
  Travel: '#0069b4',
  Other: 'var(--modus-wc-color-base-content-low-contrast)',
}

type Tab = 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Draft'
const TABS: Tab[] = ['All', 'Pending', 'Approved', 'Rejected', 'Draft']

const TAB_FILTER: Record<Tab, (e: Expense) => boolean> = {
  All: () => true,
  Pending: (e) => e.status === 'Pending',
  Approved: (e) => e.status === 'Approved',
  Rejected: (e) => e.status === 'Rejected',
  Draft: (e) => e.status === 'Draft',
}

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'job-az'

function fmt(n: number) {
  return '$' + n.toLocaleString()
}

function parseDateMs(d: string): number {
  return new Date(d).getTime()
}

function getCategoryTotals(expenses: Expense[]): { category: ExpenseCategory; total: number; pct: number }[] {
  const map: Partial<Record<ExpenseCategory, number>> = {}
  let grand = 0
  for (const e of expenses) {
    map[e.category] = (map[e.category] ?? 0) + e.amount
    grand += e.amount
  }
  const cats: ExpenseCategory[] = ['Labor', 'Materials', 'Equipment', 'Subcontractor', 'Travel', 'Other']
  return cats
    .filter((c) => (map[c] ?? 0) > 0)
    .map((c) => ({ category: c, total: map[c]!, pct: Math.round(((map[c] ?? 0) / grand) * 100) }))
    .sort((a, b) => b.total - a.total)
}

export default function ExpenseHub() {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const filtered = EXPENSES
    .filter(TAB_FILTER[activeTab])
    .filter((e) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        e.description.toLowerCase().includes(q) ||
        e.jobName.toLowerCase().includes(q) ||
        e.submittedBy.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'date-desc':   return parseDateMs(b.date) - parseDateMs(a.date)
        case 'date-asc':    return parseDateMs(a.date) - parseDateMs(b.date)
        case 'amount-desc': return b.amount - a.amount
        case 'amount-asc':  return a.amount - b.amount
        case 'job-az':      return a.jobName.localeCompare(b.jobName)
      }
    })

  const totalSubmitted = EXPENSES.reduce((s, e) => s + e.amount, 0)
  const totalApproved = EXPENSES.filter((e) => e.status === 'Approved').reduce((s, e) => s + e.amount, 0)
  const totalPending = EXPENSES.filter((e) => e.status === 'Pending' || e.status === 'Draft').reduce((s, e) => s + e.amount, 0)
  const totalRejected = EXPENSES.filter((e) => e.status === 'Rejected').reduce((s, e) => s + e.amount, 0)

  const tabCount: Record<Tab, number> = {
    All: EXPENSES.length,
    Pending: EXPENSES.filter(TAB_FILTER.Pending).length,
    Approved: EXPENSES.filter(TAB_FILTER.Approved).length,
    Rejected: EXPENSES.filter(TAB_FILTER.Rejected).length,
    Draft: EXPENSES.filter(TAB_FILTER.Draft).length,
  }

  return (
    <div className="hub-page">
      {/* Header */}
      <h1 className="hub-title">
        <ModusWcIcon name="credit_card" size="md" decorative />
        Expenses
      </h1>

      {/* KPI summary */}
      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">Total Submitted</span>
          <span className="kpi-value">{fmt(totalSubmitted)}</span>
          <span className="kpi-sub">{EXPENSES.length} expenses</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Approved</span>
          <span className="kpi-value kpi-value--success">{fmt(totalApproved)}</span>
          <span className="kpi-sub">
            {EXPENSES.filter((e) => e.status === 'Approved').length} expenses
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pending Review</span>
          <span className="kpi-value kpi-value--warning">{fmt(totalPending)}</span>
          <span className="kpi-sub">
            {EXPENSES.filter((e) => ['Pending', 'Draft'].includes(e.status)).length} expenses
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Rejected</span>
          <span className="kpi-value kpi-value--danger">{fmt(totalRejected)}</span>
          <span className="kpi-sub">
            {EXPENSES.filter((e) => e.status === 'Rejected').length} expenses
          </span>
        </div>
      </div>

      {/* Expense list */}
      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Tab filter */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'flex', pointerEvents: 'none',
              }}>
                <ModusWcIcon name="search" size="sm" decorative />
              </span>
              <input
                type="text"
                placeholder="Search description, job, or person…"
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
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Sort expenses"
              style={{
                fontSize: '0.875rem', padding: '0.5rem 0.75rem', border: '1px solid var(--modus-wc-color-base-200)',
                borderRadius: 6, background: 'var(--modus-wc-color-base-page)',
                color: 'var(--modus-wc-color-base-content)', fontFamily: 'Open Sans, sans-serif', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <option value="date-desc">Date (newest)</option>
              <option value="date-asc">Date (oldest)</option>
              <option value="amount-desc">Amount (high–low)</option>
              <option value="amount-asc">Amount (low–high)</option>
              <option value="job-az">Job (A–Z)</option>
            </select>
          </div>

          {/* List items */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem', gap: '0.5rem', overflowY: 'auto' }}>
            {filtered.map((exp) => (
              <div
                key={exp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 6,
                  border: '1px solid var(--modus-wc-color-base-200)',
                  background: 'var(--modus-wc-color-base-page)',
                }}
              >
                {/* Category colour strip */}
                <div
                  style={{
                    width: 4,
                    alignSelf: 'stretch',
                    borderRadius: 2,
                    flexShrink: 0,
                    background: CATEGORY_COLOR[exp.category],
                  }}
                />

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Top row: description + amount */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--modus-wc-color-base-content)', lineHeight: 1.3 }}>
                      {exp.description}
                    </span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--modus-wc-color-base-content)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {fmt(exp.amount)}
                    </span>
                  </div>

                  {/* Bottom row: meta + badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {/* Category pill */}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: CATEGORY_COLOR[exp.category], flexShrink: 0 }} />
                        {exp.category}
                      </span>
                      {/* Job */}
                      <span className="text-muted">{exp.jobName}</span>
                      {/* Date */}
                      <span className="text-muted">{exp.date}</span>
                      {/* Submitted by */}
                      <span className="text-muted">{exp.submittedBy}</span>
                    </div>
                    <ModusWcBadge color={STATUS_COLOR[exp.status]} size="sm" text={exp.status} />
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="empty-state">
                <ModusWcIcon name="credit_card" size="lg" decorative />
                <span>{search ? 'No expenses match your filters' : 'No expenses in this category'}</span>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
