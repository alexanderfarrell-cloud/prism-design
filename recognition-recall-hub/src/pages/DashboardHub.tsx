import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModusWcIcon, ModusWcDropdownMenu, ModusWcMenuItem } from '@trimble-oss/moduswebcomponents-react'
import { usePeriodsContext } from '../context/PeriodsContext'
import { getPendingClosePeriods } from '../data/periods'

function MeatballMenu() {
  return (
    <button
      aria-label="More options"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 6px',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        flexShrink: 0,
        color: 'var(--modus-wc-color-base-content-low-contrast)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--modus-wc-color-base-100)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', display: 'block' }} />
      ))}
    </button>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`
}

// ─── Recent Jobs data ─────────────────────────────────────────────────────────

const RECENT_JOBS = [
  {
    id: 'PRJ-2024-0051',
    name: 'Downtown Tower — Phase 2',
    customer: 'Meridian Construction Group',
    location: 'Portland, OR',
    startDate: 'Jan 8, 2024',
    endDate: 'Nov 30, 2025',
    contractValue: 4_200_000,
    spentPct: 68,
    status: 'Active' as const,
  },
  {
    id: 'PRJ-2024-0048',
    name: 'Highway 89 Bridge Expansion',
    customer: 'State Dept. of Transportation',
    location: 'Salem, OR',
    startDate: 'Mar 1, 2024',
    endDate: 'Sep 15, 2026',
    contractValue: 8_500_000,
    spentPct: 42,
    status: 'Active' as const,
  },
  {
    id: 'PRJ-2023-0038',
    name: 'Airport Terminal Renovation',
    customer: 'Regional Airport Authority',
    location: 'Hillsboro, OR',
    startDate: 'Oct 1, 2023',
    endDate: 'Apr 30, 2026',
    contractValue: 12_300_000,
    spentPct: 77,
    status: 'Active' as const,
  },
]

const JOB_STATUS_COLOR: Record<string, 'success' | 'warning' | 'secondary' | 'primary'> = {
  Active: 'success',
  'On Hold': 'warning',
  Completed: 'secondary',
  Draft: 'secondary',
}

function progColor(pct: number) {
  if (pct >= 90) return 'var(--modus-wc-color-danger, #da212c)'
  if (pct >= 75) return 'var(--modus-wc-color-warning, #fbad26)'
  return 'var(--modus-wc-color-primary)'
}

// ─── Recent Expenses data ─────────────────────────────────────────────────────

const EXPENSE_CATEGORY_COLOR: Record<string, string> = {
  Labor:         'var(--modus-wc-color-primary)',
  Materials:     '#e07b16',
  Equipment:     'var(--modus-wc-color-success, #006638)',
  Subcontractor: '#8b5cf6',
  Travel:        'var(--modus-wc-color-warning, #fbad26)',
  Other:         'var(--modus-wc-color-base-content-low-contrast)',
}

const EXPENSE_STATUS_COLOR: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  Approved: 'success',
  Pending:  'warning',
  Rejected: 'danger',
  Draft:    'secondary',
}

const RECENT_EXPENSES = [
  {
    id: 'EXP-2025-0312',
    date: 'May 2, 2025',
    description: 'Structural steel delivery — downtown site',
    jobName: 'Downtown Tower — Phase 2',
    category: 'Materials',
    amount: 84_500,
    submittedBy: 'Sarah Chen',
    status: 'Approved' as const,
  },
  {
    id: 'EXP-2025-0311',
    date: 'May 1, 2025',
    description: 'Concrete pour — bridge deck phase 3',
    jobName: 'Highway 89 Bridge Expansion',
    category: 'Subcontractor',
    amount: 52_300,
    submittedBy: 'Marcus Rivera',
    status: 'Pending' as const,
  },
  {
    id: 'EXP-2025-0310',
    date: 'Apr 30, 2025',
    description: 'Crane rental — tower crane May-Jun',
    jobName: 'Downtown Tower — Phase 2',
    category: 'Equipment',
    amount: 18_900,
    submittedBy: 'Sarah Chen',
    status: 'Approved' as const,
  },
]

// ─── Recent Billing data ──────────────────────────────────────────────────────

const BILLING_STATUS_COLOR: Record<string, 'danger' | 'warning' | 'primary' | 'success' | 'secondary'> = {
  Overdue:  'danger',
  Pending:  'warning',
  Approved: 'primary',
  Paid:     'success',
  Draft:    'secondary',
}

const RECENT_INVOICES = [
  {
    id: 'INV-2025-0142',
    jobName: 'Downtown Tower — Phase 2',
    customer: 'Meridian Construction Group',
    amount: 234_500,
    dueDate: 'May 15, 2025',
    status: 'Overdue' as const,
  },
  {
    id: 'INV-2025-0141',
    jobName: 'Highway 89 Bridge Expansion',
    customer: 'State Dept. of Transportation',
    amount: 580_000,
    dueDate: 'May 20, 2025',
    status: 'Pending' as const,
  },
  {
    id: 'INV-2025-0140',
    jobName: 'Lakeside Residential Complex',
    customer: 'Summit Development Corp',
    amount: 95_000,
    dueDate: 'May 25, 2025',
    status: 'Approved' as const,
  },
]

// ─── Add CTA ──────────────────────────────────────────────────────────────────

const ADD_ITEMS = [
  { label: 'Add Job',      icon: 'assignment',  path: '/jobs' },
  { label: 'Add Billing',  icon: 'receipt',     path: '/billing' },
  { label: 'Add Customer', icon: 'contacts',    path: '/customers' },
  { label: 'Add Expense',  icon: 'credit_card', path: '/expenses' },
  { label: 'Add Vendor',   icon: 'business',    path: '/vendors' },
]

function AddButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        aria-label="Add"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 99, cursor: 'pointer',
          border: 'none',
          background: 'var(--modus-wc-color-primary)',
          color: '#fff',
          fontFamily: 'Open Sans, sans-serif', fontSize: '0.875rem', fontWeight: 600,
        }}
      >
        <ModusWcIcon name="add" size="sm" decorative />
        Add
        <ModusWcIcon name="expand_more" size="sm" decorative />
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            zIndex: 100, background: 'var(--modus-wc-color-base-page)',
            border: '1px solid var(--modus-wc-color-base-200)',
            borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            padding: '0.375rem 0', minWidth: 180,
            display: 'flex', flexDirection: 'column',
          }}
        >
          {ADD_ITEMS.map(({ label, icon, path }) => (
            <button
              key={label}
              role="menuitem"
              onClick={() => { setOpen(false); navigate(path) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.55rem 1rem', textAlign: 'left',
                fontFamily: 'Open Sans, sans-serif', fontSize: '0.875rem',
                color: 'var(--modus-wc-color-base-content)',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--modus-wc-color-base-100)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <ModusWcIcon name={icon} size="sm" decorative />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Widget shell ─────────────────────────────────────────────────────────────

function Widget({
  icon, title, viewAllPath, children,
}: {
  icon: string
  title: string
  viewAllPath: string
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      border: '1px solid var(--modus-wc-color-base-200)',
      borderRadius: 8, overflow: 'hidden',
      background: 'var(--modus-wc-color-base-page)',
    }}>
      {/* Widget header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--modus-wc-color-base-200)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ModusWcIcon name={icon} size="sm" decorative />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--modus-wc-color-base-content)' }}>
            {title}
          </span>
        </div>
        <button
          onClick={() => navigate(viewAllPath)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--modus-wc-color-primary)', fontFamily: 'inherit',
            padding: '2px 0',
          }}
        >
          View All
        </button>
      </div>
      {/* Widget body */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}

function WidgetRow({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      padding: '0.75rem 1rem',
      borderBottom: last ? 'none' : '1px solid var(--modus-wc-color-base-200)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {children}
    </div>
  )
}

// ─── Recent Jobs widget ───────────────────────────────────────────────────────

function RecentJobsWidget() {
  return (
    <Widget icon="assignment" title="Recent Jobs" viewAllPath="/jobs">
      {RECENT_JOBS.map((job, i) => (
        <WidgetRow key={job.id} last={i === RECENT_JOBS.length - 1}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--modus-wc-color-base-content)', lineHeight: 1.3 }}>
              {job.name}
            </span>
            <MeatballMenu />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
            <ModusWcIcon name="location" size="xs" decorative />
            <span style={{ fontSize: '0.72rem' }}>{job.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
            <ModusWcIcon name="calendar" size="xs" decorative />
            <span style={{ fontSize: '0.72rem' }}>{job.startDate} – {job.endDate}</span>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>Progress</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: progColor(job.spentPct) }}>{job.spentPct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--modus-wc-color-base-200)' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${job.spentPct}%`, background: progColor(job.spentPct) }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>Contract Value</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--modus-wc-color-base-content)' }}>{fmt(job.contractValue)}</span>
          </div>
        </WidgetRow>
      ))}
    </Widget>
  )
}

// ─── Recent Expenses widget ───────────────────────────────────────────────────

function RecentExpensesWidget() {
  return (
    <Widget icon="credit_card" title="Recent Expenses" viewAllPath="/expenses">
      {RECENT_EXPENSES.map((exp, i) => (
        <WidgetRow key={exp.id} last={i === RECENT_EXPENSES.length - 1}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--modus-wc-color-base-content)', lineHeight: 1.3, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {exp.description}
            </span>
            <MeatballMenu />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: EXPENSE_CATEGORY_COLOR[exp.category], flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
              {exp.category} · {exp.date}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
            <ModusWcIcon name="person" size="xs" decorative />
            <span style={{ fontSize: '0.72rem' }}>{exp.submittedBy} · {exp.jobName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>Amount</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--modus-wc-color-base-content)' }}>{fmt(exp.amount)}</span>
          </div>
        </WidgetRow>
      ))}
    </Widget>
  )
}

// ─── Recent Billing widget ────────────────────────────────────────────────────

function RecentBillingWidget() {
  return (
    <Widget icon="receipt" title="Recent Billing" viewAllPath="/billing">
      {RECENT_INVOICES.map((inv, i) => (
        <WidgetRow key={inv.id} last={i === RECENT_INVOICES.length - 1}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--modus-wc-color-base-content)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {inv.jobName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--modus-wc-color-base-content-low-contrast)', marginTop: 1 }}>
                {inv.customer}
              </div>
            </div>
            <MeatballMenu />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--modus-wc-color-base-content-low-contrast)', marginTop: 2 }}>
            <ModusWcIcon name="calendar" size="xs" decorative />
            <span style={{ fontSize: '0.72rem' }}>Due {inv.dueDate}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--modus-wc-color-base-300)' }}>·</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>{inv.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>Amount</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--modus-wc-color-base-content)' }}>${inv.amount.toLocaleString()}</span>
          </div>
        </WidgetRow>
      ))}
    </Widget>
  )
}

// ─── Strategic KPIs ───────────────────────────────────────────────────────────

const ACTIVE_JOBS = RECENT_JOBS // all are Active in sample data
const TOTAL_CONTRACT  = ACTIVE_JOBS.reduce((s, j) => s + j.contractValue, 0)
const TOTAL_COST      = ACTIVE_JOBS.reduce((s, j) => s + j.contractValue * (j.spentPct / 100) * 0.82, 0)
const GROSS_MARGIN    = ((TOTAL_CONTRACT - TOTAL_COST) / TOTAL_CONTRACT) * 100
const OUTSTANDING_AR  = RECENT_INVOICES
  .filter((i) => i.status === 'Overdue' || i.status === 'Pending')
  .reduce((s, i) => s + i.amount, 0)
const JOBS_AT_RISK    = RECENT_JOBS.filter((j) => j.spentPct >= 75).length

const STAT_CARDS = [
  {
    label: 'Active Contract Value',
    value: `$${(TOTAL_CONTRACT / 1_000_000).toFixed(1)}M`,
    sub: `${ACTIVE_JOBS.length} active jobs`,
    color: 'var(--modus-wc-color-base-content)',
    icon: 'trending_up',
  },
  {
    label: 'Gross Margin',
    value: `${GROSS_MARGIN.toFixed(1)}%`,
    sub: 'Across active portfolio',
    color: GROSS_MARGIN >= 15
      ? 'var(--modus-wc-color-success, #006638)'
      : 'var(--modus-wc-color-warning, #fbad26)',
    icon: 'bar_chart',
  },
  {
    label: 'Outstanding AR',
    value: `$${(OUTSTANDING_AR / 1_000).toFixed(0)}K`,
    sub: `${RECENT_INVOICES.filter((i) => i.status === 'Overdue' || i.status === 'Pending').length} unpaid invoices`,
    color: OUTSTANDING_AR > 500_000
      ? 'var(--modus-wc-color-danger, #da212c)'
      : 'var(--modus-wc-color-warning, #fbad26)',
    icon: 'account_balance',
  },
  {
    label: 'Jobs At Risk',
    value: String(JOBS_AT_RISK),
    sub: JOBS_AT_RISK === 0 ? 'All jobs on track' : `≥75% budget consumed`,
    color: JOBS_AT_RISK === 0
      ? 'var(--modus-wc-color-success, #006638)'
      : JOBS_AT_RISK >= 2
      ? 'var(--modus-wc-color-danger, #da212c)'
      : 'var(--modus-wc-color-warning, #fbad26)',
    icon: 'warning',
  },
]

// ─── DashboardHub ─────────────────────────────────────────────────────────────

function TodoActionDropdown({
  primaryLabel, primaryPath, secondaryLabel, secondaryPath, color = 'danger',
}: {
  primaryLabel: string; primaryPath: string
  secondaryLabel: string; secondaryPath: string
  color?: 'primary' | 'secondary' | 'danger' | 'warning'
}) {
  const navigate = useNavigate()
  const close = (e: Event) => {
    const el = (e.target as HTMLElement).closest('modus-wc-dropdown-menu') as HTMLElement & { menuVisible: boolean }
    if (el) el.menuVisible = false
  }
  return (
    <ModusWcDropdownMenu
      buttonAriaLabel="Choose action"
      buttonColor="primary"
      buttonSize="sm"
      buttonVariant="outlined"
      buttonShape="ellipse"
      menuBordered
      menuOffset={6}
      menuPlacement="bottom-end"
      menuSize="sm"
    >
      <div slot="button" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.8125rem', fontWeight: 600 }}>{primaryLabel}</span>
        <ModusWcIcon name="expand_more" size="xs" decorative />
      </div>
      <div slot="menu">
        <ModusWcMenuItem
          label={primaryLabel}
          value="primary"
          onItemSelect={(e: Event) => { close(e); navigate(primaryPath) }}
        />
        <ModusWcMenuItem
          label={secondaryLabel}
          value="secondary"
          onItemSelect={(e: Event) => { close(e); navigate(secondaryPath) }}
        />
      </div>
    </ModusWcDropdownMenu>
  )
}

function TodoSection() {
  const navigate = useNavigate()
  const { periods } = usePeriodsContext()
  const [showExtra, setShowExtra] = useState(false)
  const all = getPendingClosePeriods(periods)
  const visible = all.slice(0, 1)
  if (!visible.length) return null
  return (
    <div style={{
      border: '1px solid var(--modus-wc-color-base-200)',
      borderRadius: 8,
      overflow: 'hidden',
      background: 'var(--modus-wc-color-base-page)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--modus-wc-color-base-200)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ModusWcIcon name="check_circle" size="sm" decorative />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--modus-wc-color-base-content)' }}>To Do</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setShowExtra(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: 'var(--modus-wc-color-base-content-low-contrast)', fontFamily: 'inherit', padding: '2px 0', textDecoration: 'underline' }}
          >
            {showExtra ? 'Hide extra' : 'Show extra'}
          </button>
        </div>
      </div>

      {/* Extra cards — hidden for MVP */}
      {showExtra && (
        <>
          {/* Upcoming close reminder — friendly tone */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--modus-wc-color-base-200)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'color-mix(in srgb, var(--modus-wc-color-primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ModusWcIcon name="calendar_today" size="xs" decorative style={{ color: 'var(--modus-wc-color-primary)' } as React.CSSProperties} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content)', marginBottom: 2 }}>
                May is coming to a close
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
                Review your open items and close the period when you're ready to lock your books.
              </div>
            </div>
            <button
              onClick={() => navigate('/periods')}
              style={{ padding: '0.3rem 0.75rem', borderRadius: 99, border: '1px solid var(--modus-wc-color-primary)', background: 'transparent', color: 'var(--modus-wc-color-primary)', fontFamily: 'Open Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
            >
              Review period
            </button>
          </div>
          {/* Job costing warning card — minimal */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--modus-wc-color-base-200)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'color-mix(in srgb, var(--modus-wc-color-warning, #fbad26) 18%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ModusWcIcon name="warning" size="xs" decorative style={{ color: '#7a5200' } as React.CSSProperties} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content)', marginBottom: 2 }}>
                May 2026 is ending soon
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
                $156,800 outstanding. Collect before May 31 or the income rolls into next month.
              </div>
            </div>
            <TodoActionDropdown
              primaryLabel="Review invoices"
              primaryPath="/billing"
              secondaryLabel="Close period"
              secondaryPath="/periods/close?id=2026-05"
              color="warning"
            />
          </div>
          {/* Single-job missing expenses spotlight */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--modus-wc-color-base-200)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'color-mix(in srgb, var(--modus-wc-color-warning, #fbad26) 18%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ModusWcIcon name="assignment" size="xs" decorative style={{ color: '#7a5200' } as React.CSSProperties} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content)', marginBottom: 2 }}>
                Riverside Commons — no expenses logged this month
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
                $12,000 budgeted but nothing recorded yet. Did work happen that wasn't logged?
              </div>
            </div>
            <TodoActionDropdown
              primaryLabel="Check job"
              primaryPath="/jobs"
              secondaryLabel="Close period"
              secondaryPath="/periods/close?id=2026-05"
              color="warning"
            />
          </div>
          {/* Summary — multiple jobs with no expenses */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--modus-wc-color-base-200)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'color-mix(in srgb, var(--modus-wc-color-warning, #fbad26) 18%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ModusWcIcon name="list" size="xs" decorative style={{ color: '#7a5200' } as React.CSSProperties} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content)', marginBottom: 2 }}>
                3 active jobs have no expenses logged this month
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
                $28,500 budgeted across these jobs. Worth a quick check before May closes.
              </div>
            </div>
            <TodoActionDropdown
              primaryLabel="Review jobs"
              primaryPath="/jobs"
              secondaryLabel="Close period"
              secondaryPath="/periods/close?id=2026-05"
              color="warning"
            />
          </div>
        </>
      )}

      {/* MVP card — single period-close row */}
      {visible.map((p) => (
        <div
          key={p.id}
          style={{
            padding: '0.75rem 1rem',
            borderBottom: 'none',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'color-mix(in srgb, var(--modus-wc-color-warning, #fbad26) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ModusWcIcon name="calendar_today" size="xs" decorative style={{ color: '#7a5200' } as React.CSSProperties} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content)', marginBottom: 2 }}>
              {p.label} is ending soon
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
              Want to close and lock your books for this period?
            </div>
          </div>
          <button
            onClick={() => navigate(`/periods/close?id=${p.id}`)}
            style={{ padding: '0.3rem 0.75rem', borderRadius: 99, border: '1px solid var(--modus-wc-color-primary)', background: 'transparent', color: 'var(--modus-wc-color-primary)', fontFamily: 'Open Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            Close now
          </button>
        </div>
      ))}
    </div>
  )
}

export default function DashboardHub() {
  return (
    <div className="hub-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 className="hub-title" style={{ marginBottom: 2 }}>
            <ModusWcIcon name="dashboard" size="md" decorative />
            Dashboard
          </h1>
          <span style={{ fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
            Welcome back, Alex Johnson
          </span>
        </div>
        <AddButton />
      </div>

      {/* Strategic KPI stat cards */}
      <div className="kpi-row">
        {STAT_CARDS.map(({ label, value, sub, color, icon }) => (
          <div key={label} className="kpi-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="kpi-label">{label}</span>
              <ModusWcIcon name={icon} size="sm" decorative
                style={{ color: 'var(--modus-wc-color-base-content-low-contrast)' } as React.CSSProperties}
              />
            </div>
            <span className="kpi-value" style={{ color, fontSize: '1.35rem' }}>{value}</span>
            <span className="kpi-sub">{sub}</span>
          </div>
        ))}
      </div>

      {/* To-Do: period-close reminders */}
      <TodoSection />

      {/* Widgets grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        alignItems: 'start',
      }}>
        <RecentJobsWidget />
        <RecentExpensesWidget />
        <RecentBillingWidget />
      </div>
    </div>
  )
}
