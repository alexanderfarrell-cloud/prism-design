import React, { useState, useRef, useEffect } from 'react'
import {
  ModusWcCard,
  ModusWcTypography,
  ModusWcIcon,
  ModusWcBadge,
  ModusWcButton,
  ModusWcCheckbox,
} from '@trimble-oss/moduswebcomponents-react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HubJob {
  id: string
  name: string
  customer: string
  status: 'Active' | 'On Hold' | 'Completed' | 'Pending' | 'Draft'
  contractValue: number
  spentPct: number
  pm: string
  startDate: string
  endDate: string
  location: string
  costToDate: number
  projectedCost: number
  billedToDate: number
  collections: number
}

interface MilestoneData {
  id: string
  name: string
  budgetPct: number
  budgetAmount: number
  targetDate: string
  targetDatePct: number
  isCompleted: boolean
  completedDate?: string
}

type HealthState = 'on-track' | 'at-risk' | 'over-budget' | 'ahead'
type TickState = 'upcoming' | 'completed' | 'missed-mild' | 'missed-severe'

// ─── Data derivation ─────────────────────────────────────────────────────────

function buildMilestones(job: HubJob): MilestoneData[] {
  const phases = [
    { name: 'Site & Foundation', budgetPct: 15, timeGatePct: 12 },
    { name: 'Structural Frame',  budgetPct: 35, timeGatePct: 30 },
    { name: 'MEP & Enclosure',   budgetPct: 62, timeGatePct: 58 },
    { name: 'Interior Finish',   budgetPct: 84, timeGatePct: 78 },
  ]
  return phases.map((p, i) => ({
    id: `${job.id}-m${i + 1}`,
    name: p.name,
    budgetPct: p.budgetPct,
    budgetAmount: job.contractValue * (p.budgetPct / 100),
    targetDate: '—',
    targetDatePct: p.timeGatePct,
    isCompleted: job.spentPct > p.budgetPct + 5,
  }))
}

function buildCostCategories(job: HubJob) {
  const a = job.costToDate
  const e = job.projectedCost
  return [
    { label: 'Labor',       actual: a * 0.35, estimate: e * 0.30 },
    { label: 'Material',    actual: a * 0.28, estimate: e * 0.32 },
    { label: 'Subcontract', actual: a * 0.25, estimate: e * 0.25 },
    { label: 'Equipment',   actual: a * 0.08, estimate: e * 0.08 },
    { label: 'Other',       actual: a * 0.04, estimate: e * 0.05 },
  ]
}

// ─── Health logic ─────────────────────────────────────────────────────────────

function computeHealth(spendPct: number, milestones: MilestoneData[]): HealthState {
  const maxOverrun = milestones
    .filter(m => !m.isCompleted && spendPct >= m.budgetPct)
    .reduce((max, m) => Math.max(max, spendPct - m.budgetPct), 0)
  if (maxOverrun > 10) return 'over-budget'
  if (maxOverrun > 0)  return 'at-risk'
  const progressPct = milestones.filter(m => m.isCompleted).reduce((s, m) => s + m.budgetPct, 0)
  const gap = spendPct - progressPct
  if (gap < -10) return 'ahead'
  if (gap <= 5)  return 'on-track'
  if (gap <= 20) return 'at-risk'
  return 'over-budget'
}

function getTickState(milestone: MilestoneData, spendPct: number): TickState {
  if (milestone.isCompleted) return 'completed'
  if (spendPct >= milestone.budgetPct)
    return (spendPct - milestone.budgetPct) > 10 ? 'missed-severe' : 'missed-mild'
  return 'upcoming'
}

const HEALTH_FILL_CLASS: Record<HealthState, string> = {
  'on-track':    'budget-fill-primary',
  'at-risk':     'budget-fill-warning',
  'over-budget': 'budget-fill-danger',
  'ahead':       'budget-fill-success',
}

const HEALTH_LABEL: Record<HealthState, string> = {
  'on-track':    'On Track',
  'at-risk':     'At Risk',
  'over-budget': 'Over Budget',
  'ahead':       'Ahead of Schedule',
}

const TICK_COLOR: Record<TickState, string> = {
  upcoming:        'var(--modus-wc-color-base-300, #b0b8c1)',
  completed:       'var(--modus-wc-color-success, #006638)',
  'missed-mild':   'var(--modus-wc-color-warning, #fbad26)',
  'missed-severe': 'var(--modus-wc-color-danger, #da212c)',
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000)     return '$' + (n / 1_000).toFixed(1) + 'K'
  return '$' + n.toFixed(2)
}

// ─── Milestone tick ───────────────────────────────────────────────────────────

function MilestoneTick({
  milestone,
  isHovered,
  onHover,
  onToggle,
  spendPct,
  actualSpend,
}: {
  milestone: MilestoneData
  isHovered: boolean
  onHover: (id: string | null) => void
  onToggle: (id: string) => void
  spendPct: number
  actualSpend: number
}) {
  const state  = getTickState(milestone, spendPct)
  const color  = TICK_COLOR[state]
  const dotFill = state === 'upcoming' ? 'transparent' : color

  const tooltipStyle: React.CSSProperties =
    milestone.budgetPct < 25
      ? { left: 0, transform: 'none' }
      : milestone.budgetPct > 75
      ? { right: 0, left: 'auto', transform: 'none' }
      : { left: '50%', transform: 'translateX(-50%)' }

  const phaseOver = actualSpend > milestone.budgetAmount
  const delta     = Math.abs(actualSpend - milestone.budgetAmount)

  return (
    <div
      className="milestone-tick-container"
      style={{ left: `${milestone.budgetPct}%` }}
      onMouseEnter={() => onHover(milestone.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onToggle(milestone.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onToggle(milestone.id)}
      aria-label={`${milestone.name} — ${state === 'completed' ? 'mark incomplete' : 'mark complete'}`}
    >
      {isHovered && (
        <div className="milestone-tooltip" style={tooltipStyle}>
          <div className="milestone-tooltip-name">{milestone.name}</div>
          <div className="milestone-tooltip-row">
            <span className="milestone-tooltip-label">Phase budget</span>
            <span className="milestone-tooltip-value">
              {fmt(milestone.budgetAmount)} ({milestone.budgetPct}%)
            </span>
          </div>
          <div className="milestone-tooltip-row">
            <span className="milestone-tooltip-label">
              {phaseOver ? 'Overspent by' : 'Remaining'}
            </span>
            <span className={`milestone-tooltip-value ${phaseOver ? 'tooltip-over' : 'tooltip-under'}`}>
              {phaseOver ? `+${fmt(delta)}` : fmt(delta)}
            </span>
          </div>
          <div className="milestone-tooltip-row">
            <span className="milestone-tooltip-label">Status</span>
            <span className="milestone-tooltip-value">
              {milestone.isCompleted ? 'Completed' : `In progress`}
            </span>
          </div>
          <div className="milestone-tooltip-action">
            {milestone.isCompleted ? 'Click to undo completion' : 'Click to mark complete'}
          </div>
        </div>
      )}

      <div className="milestone-dot" style={{ background: dotFill, borderColor: color }}>
        {state === 'completed' && <span className="milestone-dot-icon">✓</span>}
        {(state === 'missed-mild' || state === 'missed-severe') && <span className="milestone-dot-icon">!</span>}
      </div>
      <div className="milestone-tick-line" style={{ background: color }} />
    </div>
  )
}

// ─── Budget bar ───────────────────────────────────────────────────────────────

function BudgetBar({
  spendPct,
  actualSpend,
  milestones,
  onToggleMilestone,
  showMilestones = true,
}: {
  spendPct: number
  actualSpend: number
  milestones: MilestoneData[]
  onToggleMilestone: (id: string) => void
  showMilestones?: boolean
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const health = computeHealth(spendPct, milestones)
  const completedCount = milestones.filter(m => m.isCompleted).length

  const healthColor: Record<HealthState, string> = {
    'on-track':    'var(--modus-wc-color-primary)',
    'at-risk':     'var(--modus-wc-color-warning, #fbad26)',
    'over-budget': 'var(--modus-wc-color-danger, #da212c)',
    'ahead':       'var(--modus-wc-color-success, #006638)',
  }

  return (
    <div className="budget-bar-outer">
      {showMilestones && (
        <div className="budget-bar-label-row" aria-hidden="true">
          {milestones.map(m => (
            <span
              key={m.id}
              className="milestone-name-label"
              style={{ left: `${m.budgetPct}%`, color: TICK_COLOR[getTickState(m, spendPct)] }}
            >
              {m.name}
            </span>
          ))}
        </div>
      )}
      <div className="budget-bar-track-wrap">
        <div
          className={`budget-bar-fill ${HEALTH_FILL_CLASS[health]}`}
          style={{ width: `${Math.min(100, spendPct)}%` }}
        />
        {showMilestones && milestones.map(m => (
          <MilestoneTick
            key={m.id}
            milestone={m}
            spendPct={spendPct}
            actualSpend={actualSpend}
            isHovered={hoveredId === m.id}
            onHover={setHoveredId}
            onToggle={onToggleMilestone}
          />
        ))}
      </div>
      <div className="budget-bar-summary">
        {showMilestones && <span>{completedCount} of {milestones.length} milestones complete</span>}
        {showMilestones && <span className="budget-bar-dot">·</span>}
        <span className="budget-bar-health" style={{ color: healthColor[health] }}>
          {(health === 'at-risk' || health === 'over-budget') && '⚠ '}
          {HEALTH_LABEL[health]}
        </span>
      </div>
    </div>
  )
}

// ─── Job stat cards ───────────────────────────────────────────────────────────

function JobStatCards({
  milestones,
  spendPct,
  actualSpend,
  totalBudget,
  timePct,
  onManage,
}: {
  milestones: MilestoneData[]
  spendPct: number
  actualSpend: number
  totalBudget: number
  timePct: number
  onManage: () => void
}) {
  const health         = computeHealth(spendPct, milestones)
  const completedCount = milestones.filter(m => m.isCompleted).length
  const overdueCount   = milestones.filter(m => !m.isCompleted && spendPct > m.budgetPct + 5).length

  const variance          = actualSpend - totalBudget * (timePct / 100)
  const varianceFavorable = variance <= 0

  const [variancePopoverOpen, setVariancePopoverOpen] = useState(false)
  const varianceAnchorRef = useRef<HTMLButtonElement>(null)
  const variancePopoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!variancePopoverOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        varianceAnchorRef.current && !varianceAnchorRef.current.contains(e.target as Node) &&
        variancePopoverRef.current && !variancePopoverRef.current.contains(e.target as Node)
      ) setVariancePopoverOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [variancePopoverOpen])

  const healthColor: Record<HealthState, string> = {
    'on-track':    'var(--modus-wc-color-primary)',
    'at-risk':     'var(--modus-wc-color-warning, #fbad26)',
    'over-budget': 'var(--modus-wc-color-danger, #da212c)',
    'ahead':       'var(--modus-wc-color-success, #006638)',
  }

  return (
    <div className="job-stat-cards">
      {/* Milestones */}
      <div className="job-stat-card">
        <span className="job-stat-card-label">Milestones</span>
        <div className="job-stat-card-value-row">
          <span className="job-stat-card-value">{completedCount}&thinsp;/&thinsp;{milestones.length}</span>
          <ModusWcButton size="sm" variant="borderless" color="secondary" onButtonClick={onManage}>
            View
          </ModusWcButton>
        </div>
        <div className="job-stat-card-meta">
          {overdueCount > 0 ? (
            <span style={{ color: 'var(--modus-wc-color-warning, #fbad26)' }}>⚠ {overdueCount} overdue</span>
          ) : 'complete'}
        </div>
      </div>

      {/* Budget Health */}
      <div className="job-stat-card">
        <span className="job-stat-card-label">Budget Health</span>
        <div className="job-stat-card-value-row">
          <span className="job-stat-card-value" style={{ color: healthColor[health], fontSize: '1.1rem' }}>
            {(health === 'at-risk' || health === 'over-budget') && '⚠ '}
            {HEALTH_LABEL[health]}
          </span>
        </div>
        <div className="job-stat-card-meta">{spendPct.toFixed(1)}% consumed</div>
      </div>

      {/* Variance */}
      <div className="job-stat-card" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="job-stat-card-label">Variance</span>
          <button
            ref={varianceAnchorRef}
            className="variance-info-btn"
            aria-label="Variance explanation"
            aria-expanded={variancePopoverOpen}
            onClick={() => setVariancePopoverOpen(o => !o)}
          >
            <ModusWcIcon name="info" size="sm" decorative />
          </button>
        </div>
        {variancePopoverOpen && (
          <div ref={variancePopoverRef} className="variance-popover">
            <p className="variance-popover-formula">Actual Spend − (Budget × % time elapsed)</p>
            <p className="variance-popover-body">
              Shows whether you're spending ahead or behind the pace of the project timeline.
            </p>
            <div className="variance-popover-legend">
              <span style={{ color: 'var(--modus-wc-color-success, #006638)' }}>− Green</span>
              {' '}= under-paced (favorable)
            </div>
            <div className="variance-popover-legend">
              <span style={{ color: 'var(--modus-wc-color-danger, #da212c)' }}>+ Red</span>
              {' '}= over-paced (unfavorable)
            </div>
          </div>
        )}
        <div className="job-stat-card-value-row">
          <span
            className="job-stat-card-value"
            style={{ color: varianceFavorable ? 'var(--modus-wc-color-success, #006638)' : 'var(--modus-wc-color-danger, #da212c)' }}
          >
            {varianceFavorable ? '−' : '+'}{fmt(Math.abs(variance))}
          </span>
        </div>
        <div className="job-stat-card-meta">vs time-based estimate</div>
      </div>
    </div>
  )
}

// ─── Milestone list panel ─────────────────────────────────────────────────────

function MilestoneListPanel({
  milestones,
  onToggle,
  onManage,
}: {
  milestones: MilestoneData[]
  onToggle: (id: string) => void
  onManage: () => void
}) {
  return (
    <div className="milestone-list">
      <div className="milestone-list-title-row">
        <span className="milestone-list-title">Milestones</span>
        <ModusWcButton size="sm" variant="borderless" color="secondary" onButtonClick={onManage}>
          Manage
        </ModusWcButton>
      </div>
      <div className="milestone-list-header">
        <span />
        <span>Milestone</span>
        <span>Budget gate</span>
        <span>Amount</span>
        <span>Status</span>
      </div>
      {milestones.map(m => {
        const badgeColor: 'success' | 'secondary' = m.isCompleted ? 'success' : 'secondary'
        const statusLabel = m.isCompleted ? 'Completed' : 'Upcoming'
        return (
          <div key={m.id} className={`milestone-list-row${m.isCompleted ? ' milestone-list-row--done' : ''}`}>
            <div className="milestone-list-check">
              <ModusWcCheckbox
                value={m.isCompleted}
                size="sm"
                aria-label={`Mark ${m.name} ${m.isCompleted ? 'incomplete' : 'complete'}`}
                onInputChange={() => onToggle(m.id)}
              />
            </div>
            <span className="milestone-list-name">{m.name}</span>
            <span className="milestone-list-budget">{m.budgetPct}%</span>
            <span className="milestone-list-budget">{fmt(m.budgetAmount)}</span>
            <div className="milestone-list-badge">
              <ModusWcBadge color={badgeColor} size="sm" text={statusLabel} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Milestone side panel ─────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '0.35rem 0.5rem',
  border: '1px solid var(--modus-wc-color-base-200)', borderRadius: 4,
  fontFamily: 'Open Sans, sans-serif', fontSize: '0.8125rem',
  background: 'var(--modus-wc-color-base-page)', color: 'var(--modus-wc-color-base-content)',
  outline: 'none',
}

const BTN_PRIMARY: React.CSSProperties = {
  padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
  background: 'var(--modus-wc-color-primary)', color: '#fff',
  fontFamily: 'Open Sans, sans-serif', fontSize: '0.8125rem', fontWeight: 600,
}

const BTN_GHOST: React.CSSProperties = {
  padding: '5px 14px', borderRadius: 4, cursor: 'pointer',
  border: '1px solid var(--modus-wc-color-base-200)',
  background: 'transparent', color: 'var(--modus-wc-color-base-content)',
  fontFamily: 'Open Sans, sans-serif', fontSize: '0.8125rem',
}

interface MilestoneDraft {
  name: string
  budgetPct: string
  targetDate: string
}

const EMPTY_DRAFT: MilestoneDraft = { name: '', budgetPct: '', targetDate: '' }

function MilestoneSidePanel({
  milestones,
  totalBudget,
  onClose,
  onToggle,
  onAdd,
  onUpdate,
  onDelete,
}: {
  milestones: MilestoneData[]
  totalBudget: number
  onClose: () => void
  onToggle: (id: string) => void
  onAdd: (m: MilestoneData) => void
  onUpdate: (m: MilestoneData) => void
  onDelete: (id: string) => void
}) {
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editDraft, setEditDraft]   = useState<MilestoneDraft>(EMPTY_DRAFT)
  const [showAdd, setShowAdd]       = useState(false)
  const [addDraft, setAddDraft]     = useState<MilestoneDraft>(EMPTY_DRAFT)

  function startEdit(m: MilestoneData) {
    setEditingId(m.id)
    setEditDraft({
      name:       m.name,
      budgetPct:  String(m.budgetPct),
      targetDate: m.targetDate === '—' ? '' : m.targetDate,
    })
    setShowAdd(false)
  }

  function saveEdit(m: MilestoneData) {
    const pct = Math.min(100, Math.max(0, Number(editDraft.budgetPct) || m.budgetPct))
    onUpdate({
      ...m,
      name:       editDraft.name.trim() || m.name,
      budgetPct:  pct,
      budgetAmount: totalBudget * (pct / 100),
      targetDate: editDraft.targetDate || '—',
    })
    setEditingId(null)
  }

  function saveAdd() {
    const pct = Math.min(100, Math.max(0, Number(addDraft.budgetPct) || 0))
    onAdd({
      id:           `m-${Date.now()}`,
      name:         addDraft.name.trim() || 'New Milestone',
      budgetPct:    pct,
      budgetAmount: totalBudget * (pct / 100),
      targetDate:   addDraft.targetDate || '—',
      targetDatePct: pct,
      isCompleted:  false,
    })
    setAddDraft(EMPTY_DRAFT)
    setShowAdd(false)
  }

  return (
    <>
      <div className="milestone-panel-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="milestone-side-panel" role="dialog" aria-label="Manage Milestones">

        {/* Header */}
        <div className="milestone-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ModusWcIcon name="flag" decorative />
            <ModusWcTypography hierarchy="h4" size="md" weight="semibold" label="Milestones" />
          </div>
          <ModusWcButton size="sm" variant="borderless" color="tertiary" shape="square" aria-label="Close" onButtonClick={onClose}>
            <ModusWcIcon name="close" size="sm" decorative />
          </ModusWcButton>
        </div>

        {/* Milestone list */}
        <div className="milestone-panel-body">
          {milestones.map(m => (
            <div key={m.id} className="milestone-panel-row">

              {editingId === m.id ? (
                /* ── Edit form ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'block', marginBottom: 3 }}>
                      Name
                    </label>
                    <input
                      style={INPUT_STYLE}
                      value={editDraft.name}
                      onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'block', marginBottom: 3 }}>
                        Budget gate %
                      </label>
                      <input
                        style={INPUT_STYLE}
                        type="number" min={0} max={100}
                        value={editDraft.budgetPct}
                        onChange={e => setEditDraft(d => ({ ...d, budgetPct: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'block', marginBottom: 3 }}>
                        Target date
                      </label>
                      <input
                        style={INPUT_STYLE}
                        type="date"
                        value={editDraft.targetDate}
                        onChange={e => setEditDraft(d => ({ ...d, targetDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 2 }}>
                    <button style={BTN_GHOST} onClick={() => setEditingId(null)}>Cancel</button>
                    <button style={BTN_PRIMARY} onClick={() => saveEdit(m)}>Save</button>
                  </div>
                </div>
              ) : (
                /* ── Read view ── */
                <>
                  <div className="milestone-panel-row-top">
                    <ModusWcCheckbox
                      value={m.isCompleted}
                      size="sm"
                      aria-label={`Mark ${m.name} ${m.isCompleted ? 'incomplete' : 'complete'}`}
                      onInputChange={() => onToggle(m.id)}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: m.isCompleted ? 400 : 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: m.isCompleted ? 'line-through' : 'none', color: m.isCompleted ? 'var(--modus-wc-color-base-content-low-contrast)' : 'var(--modus-wc-color-base-content)' }}>
                      {m.name}
                    </span>
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <button
                        aria-label={`Edit ${m.name}`}
                        onClick={() => startEdit(m)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'flex' }}
                      >
                        <ModusWcIcon name="pencil" size="sm" decorative />
                      </button>
                      <button
                        aria-label={`Delete ${m.name}`}
                        onClick={() => onDelete(m.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, color: 'var(--modus-wc-color-danger, #da212c)', display: 'flex' }}
                      >
                        <ModusWcIcon name="delete" size="sm" decorative />
                      </button>
                    </div>
                  </div>
                  <div className="milestone-panel-row-meta" style={{ marginTop: 4 }}>
                    <span>
                      <span className="milestone-panel-meta-label">Budget </span>
                      {m.budgetPct}% · {fmt(m.budgetAmount)}
                    </span>
                    <span>
                      <span className="milestone-panel-meta-label">Target </span>
                      {m.targetDate === '—' || !m.targetDate
                        ? <span style={{ color: 'var(--modus-wc-color-base-content-low-contrast)' }}>Not set</span>
                        : m.targetDate}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add form */}
          {showAdd && (
            <div className="milestone-panel-row" style={{ background: 'var(--modus-wc-color-base-100)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'block', marginBottom: 3 }}>
                    Name
                  </label>
                  <input
                    style={INPUT_STYLE}
                    placeholder="e.g. Final Inspection"
                    value={addDraft.name}
                    onChange={e => setAddDraft(d => ({ ...d, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'block', marginBottom: 3 }}>
                      Budget gate %
                    </label>
                    <input
                      style={INPUT_STYLE}
                      type="number" min={0} max={100} placeholder="e.g. 90"
                      value={addDraft.budgetPct}
                      onChange={e => setAddDraft(d => ({ ...d, budgetPct: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'block', marginBottom: 3 }}>
                      Target date
                    </label>
                    <input
                      style={INPUT_STYLE}
                      type="date"
                      value={addDraft.targetDate}
                      onChange={e => setAddDraft(d => ({ ...d, targetDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 2 }}>
                  <button style={BTN_GHOST} onClick={() => { setShowAdd(false); setAddDraft(EMPTY_DRAFT) }}>Cancel</button>
                  <button style={BTN_PRIMARY} onClick={saveAdd}>Add</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — Add milestone button */}
        {!showAdd && (
          <div className="milestone-panel-footer">
            <button
              style={{ ...BTN_PRIMARY, width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => { setShowAdd(true); setEditingId(null) }}
            >
              <ModusWcIcon name="add" size="sm" decorative />
              Add Milestone
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Revenue & Margin card ────────────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="rev-track">
      <div className="rev-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

function RevenueMarginCard({ job }: { job: HubJob }) {
  const marginPct = job.projectedCost < job.contractValue
    ? (job.contractValue - job.projectedCost) / job.contractValue
    : 0.08
  const revenue = {
    current: job.billedToDate,
    estimate: job.contractValue,
    currentMargin: job.billedToDate * marginPct,
    estimateMargin: job.contractValue * marginPct,
  }

  return (
    <ModusWcCard bordered={false} padding="compact">
      <div slot="title" className="flex w-full items-center justify-between gap-2">
        <ModusWcTypography hierarchy="h4" size="md" weight="semibold" label="Revenue & Margin" />
        <span className="badge-to-date">To Date</span>
      </div>
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="label-muted">Current Revenue:</span>
              <span className="amount-current">{fmt(revenue.current)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="label-muted">Estimate Revenue:</span>
              <span className="amount-secondary">{fmt(revenue.estimate)}</span>
            </div>
          </div>
          <ProgressBar value={revenue.current} max={revenue.estimate} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex flex-col">
              <span className="label-muted">Current Margin:</span>
              <span className="amount-current">{fmt(revenue.currentMargin)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="label-muted">Estimate Margin:</span>
              <span className="amount-secondary">{fmt(revenue.estimateMargin)}</span>
            </div>
          </div>
          <ProgressBar value={revenue.currentMargin} max={revenue.estimateMargin} />
        </div>
      </div>
    </ModusWcCard>
  )
}

// ─── Cost Distribution card ───────────────────────────────────────────────────

const LABEL_W = 80
const ROW_H   = 36

function getNiceTicks(max: number, targetCount = 8) {
  if (max === 0) return { ticks: [0], niceMax: 0 }
  const rawStep   = max / targetCount
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const niceStep  = Math.ceil(rawStep / magnitude) * magnitude
  const niceMax   = Math.ceil(max / niceStep) * niceStep
  const ticks: number[] = []
  for (let v = 0; v <= niceMax + niceStep * 0.01; v += niceStep) ticks.push(Math.round(v))
  return { ticks, niceMax }
}

function fmtTick(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

function CostDistributionCard({ job }: { job: HubJob }) {
  const categories = buildCostCategories(job)
  const maxVal = Math.max(job.projectedCost, job.costToDate)
  const { ticks, niceMax } = getNiceTicks(maxVal)
  const chartH = categories.length * ROW_H

  return (
    <ModusWcCard bordered={false} padding="compact">
      <div slot="title" className="flex w-full items-center justify-between gap-2">
        <ModusWcTypography hierarchy="h4" size="md" weight="semibold" label="Job Cost Distribution" />
        <span className="badge-to-date">To Date</span>
      </div>
      <div className="flex flex-col gap-3 pt-1">
        {/* Legend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="legend-dot-actual" />
            <span className="label-body">Total Actual</span>
            <span className="label-value">{fmt(job.costToDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="legend-dot-estimate" />
            <span className="label-body">Total Estimate</span>
            <span className="label-value">{fmt(job.projectedCost)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {/* Y-axis labels */}
          <div style={{ width: LABEL_W, flexShrink: 0 }}>
            {categories.map(cat => (
              <div
                key={cat.label}
                style={{ height: ROW_H, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, fontSize: '0.72rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}
              >
                {cat.label}
              </div>
            ))}
            <div style={{ height: 20 }} />
          </div>

          {/* Bar area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ position: 'relative', height: chartH }}>
              {/* Grid lines */}
              {ticks.map(tick => (
                <div
                  key={tick}
                  style={{ position: 'absolute', left: niceMax > 0 ? `${(tick / niceMax) * 100}%` : '0%', top: 0, bottom: 0, width: 1, background: 'var(--modus-wc-color-base-200)' }}
                />
              ))}
              {/* Bars */}
              {categories.map(cat => {
                const actualPct   = niceMax > 0 ? Math.min(100, (cat.actual   / niceMax) * 100) : 0
                const estimatePct = niceMax > 0 ? Math.min(100, (cat.estimate / niceMax) * 100) : 0
                return (
                  <div key={cat.label} style={{ height: ROW_H, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
                    <div style={{ height: 8, borderRadius: 4, background: 'var(--modus-wc-color-primary)', width: cat.actual > 0 ? `${actualPct}%` : 0 }} />
                    <div style={{ height: 8, borderRadius: 4, background: '#e07b16', width: cat.estimate > 0 ? `${estimatePct}%` : 0 }} />
                  </div>
                )
              })}
            </div>
            <div style={{ height: 1, background: 'var(--modus-wc-color-base-200)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {ticks.map(tick => (
                <span key={tick} style={{ fontSize: '0.65rem', color: 'var(--modus-wc-color-base-content-low-contrast)', lineHeight: 1 }}>
                  {fmtTick(tick)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModusWcCard>
  )
}

// ─── Cashflow card ────────────────────────────────────────────────────────────

function CashflowCard({ job }: { job: HubJob }) {
  const margin          = job.billedToDate - job.costToDate
  const upcomingIncome  = Math.max(0, job.contractValue - job.billedToDate) * 0.25
  const upcomingExpense = Math.max(0, job.projectedCost - job.costToDate) * 0.20
  const incomePct       = upcomingIncome > 0 ? 100 : 0

  return (
    <ModusWcCard bordered={false} padding="compact">
      <div slot="title" className="flex w-full items-center justify-between gap-2">
        <ModusWcTypography hierarchy="h4" size="md" weight="semibold" label="Upcoming Cashflow" />
        <span className="badge-to-date">To Date</span>
      </div>
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex items-center justify-between gap-2">
          <span className="label-body">Margin</span>
          <div className="flex items-center gap-2">
            <span className="amount-secondary">{fmt(margin)}</span>
            <span className="badge-success">
              <ModusWcIcon name="check" size="xs" decorative />
            </span>
          </div>
        </div>
        <div className="card-row-divider" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="link-text">Upcoming Income</span>
            <span className="amount-secondary">{fmt(upcomingIncome)}</span>
          </div>
          <div className="cashflow-track">
            <div className="cashflow-fill" style={{ width: `${incomePct}%` }} />
          </div>
        </div>
        <div className="card-row-divider" />
        <div className="flex items-center justify-between gap-2">
          <span className="link-text">Upcoming Expense</span>
          <span className="amount-secondary">{fmt(upcomingExpense)}</span>
        </div>
      </div>
    </ModusWcCard>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ job }: { job: HubJob }) {
  return (
    <div className="flex flex-col gap-3">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 360px)', gap: '0.75rem', alignItems: 'start' }}>
        <div className="flex flex-col gap-3">
          <RevenueMarginCard job={job} />
          <CostDistributionCard job={job} />
        </div>
        <CashflowCard job={job} />
      </div>
    </div>
  )
}

// ─── JobDetail ───────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<HubJob['status'], 'success' | 'warning' | 'secondary' | 'primary'> = {
  Active: 'success',
  'On Hold': 'warning',
  Completed: 'secondary',
  Pending: 'primary',
  Draft: 'secondary',
}

type DetailTab = 'overview' | 'transactions' | 'contract'
const TABS: { id: DetailTab; label: string; icon: string }[] = [
  { id: 'overview',     label: 'Overview',     icon: 'dashboard' },
  { id: 'transactions', label: 'Transactions', icon: 'receipt' },
  { id: 'contract',     label: 'Contract',     icon: 'description' },
]

const DETAIL_MENU_ITEMS = [
  { label: 'Add Job Billing',   color: 'var(--modus-wc-color-base-content)' },
  { label: 'Add Job Expenses',  color: 'var(--modus-wc-color-base-content)' },
  { label: 'Mark as Completed', color: 'var(--modus-wc-color-success, #006638)' },
  { label: 'Mark as Cancelled', color: 'var(--modus-wc-color-danger, #da212c)' },
]

export default function JobDetail({ job }: { job: HubJob }) {
  const [milestones, setMilestones] = useState<MilestoneData[]>(() => buildMilestones(job))
  const [panelOpen, setPanelOpen]   = useState(false)
  const [activeTab, setActiveTab]   = useState<DetailTab>('overview')
  const [menuOpen, setMenuOpen]     = useState(false)
  const menuRef                     = useRef<HTMLDivElement>(null)

  // Rebuild milestones when the selected job changes
  useEffect(() => {
    setMilestones(buildMilestones(job))
    setActiveTab('overview')
  }, [job.id])

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

  const timePct = Math.max(5, job.spentPct * 0.88)

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, isCompleted: !m.isCompleted } : m))
  }

  const addMilestone = (m: MilestoneData) => {
    setMilestones(prev => [...prev, m])
  }

  const updateMilestone = (updated: MilestoneData) => {
    setMilestones(prev => prev.map(m => m.id === updated.id ? updated : m))
  }

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Job header */}
      <div className="job-header" style={{ position: 'relative' }}>
        {/* Action menu — top right */}
        <div ref={menuRef} style={{ position: 'absolute', top: 12, right: 12 }}>
          <button
            aria-label="Job actions"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid var(--modus-wc-color-primary)',
              background: 'transparent',
              color: 'var(--modus-wc-color-primary)',
              fontFamily: 'Open Sans, sans-serif', fontSize: '0.8125rem', fontWeight: 600,
            }}
          >
            Actions
            <ModusWcIcon name="expand_more" size="sm" decorative />
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
              {DETAIL_MENU_ITEMS.map(({ label, color }) => (
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <ModusWcBadge color={STATUS_COLOR[job.status]} size="sm" text={job.status} />
          <span style={{ fontSize: '0.75rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>{job.id}</span>
        </div>
        <ModusWcTypography hierarchy="h1" size="xl" weight="bold" label={job.name} />
        <div style={{ marginTop: 2, marginBottom: 8 }}>
          <ModusWcTypography
            hierarchy="p"
            size="md"
            weight="semibold"
            label={job.customer}
            customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
          />
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { label: 'PM', value: job.pm },
            { label: 'Location', value: job.location },
            { label: 'Start', value: job.startDate },
            { label: 'End', value: job.endDate },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
                {label}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <ModusWcTypography
              hierarchy="p"
              size="xs"
              label="Budget Consumed"
              customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
            />
            <span className="budget-bar-pct">{job.spentPct.toFixed(1)}% spent</span>
          </div>
          <BudgetBar
            spendPct={job.spentPct}
            actualSpend={job.costToDate}
            milestones={milestones}
            onToggleMilestone={toggleMilestone}
            showMilestones={false}
          />
          <JobStatCards
            milestones={milestones}
            spendPct={job.spentPct}
            actualSpend={job.costToDate}
            totalBudget={job.contractValue}
            timePct={timePct}
            onManage={() => setPanelOpen(true)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <ModusWcIcon name={tab.icon} size="sm" decorative />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab job={job} />}
      {activeTab === 'transactions' && (
        <ModusWcCard bordered={false} padding="compact">
          <div slot="title" className="flex w-full items-center gap-2">
            <ModusWcIcon name="receipt" decorative />
            <ModusWcTypography hierarchy="h4" size="md" weight="semibold" label="Transactions" />
          </div>
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <ModusWcTypography hierarchy="p" size="sm" label="No transactions to display." customClass="text-[var(--modus-wc-color-base-content-low-contrast)]" />
          </div>
        </ModusWcCard>
      )}
      {activeTab === 'contract' && (
        <ModusWcCard bordered={false} padding="compact">
          <div slot="title" className="flex w-full items-center gap-2">
            <ModusWcIcon name="description" decorative />
            <ModusWcTypography hierarchy="h4" size="md" weight="semibold" label="Contract" />
          </div>
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>
            <ModusWcTypography hierarchy="p" size="sm" label="No contract information available." customClass="text-[var(--modus-wc-color-base-content-low-contrast)]" />
          </div>
        </ModusWcCard>
      )}

      {/* Milestone side panel */}
      {panelOpen && (
        <MilestoneSidePanel
          milestones={milestones}
          totalBudget={job.contractValue}
          onClose={() => setPanelOpen(false)}
          onToggle={toggleMilestone}
          onAdd={addMilestone}
          onUpdate={updateMilestone}
          onDelete={deleteMilestone}
        />
      )}
    </div>
  )
}
