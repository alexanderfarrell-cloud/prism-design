import { useState, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModusWcIcon } from '@trimble-oss/moduswebcomponents-react'
import { usePeriodsContext } from '../context/PeriodsContext'

// ─── Types ────────────────────────────────────────────────────────────────────

type LineItemCategory = 'Materials' | 'Labor' | 'Subcontract' | 'Equipment' | 'Other'

interface LineItem {
  id: string
  description: string
  qty: number
  unit: string
  unitCost: number
}

interface LineItemGroup {
  category: LineItemCategory
  icon: string
  items: LineItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const uid = () => Math.random().toString(36).slice(2, 9)

const TAX_RATE = 0.105 // 10.5% default

// ─── Accordion wrapper ────────────────────────────────────────────────────────

function Accordion({
  title,
  badge,
  amount,
  children,
  defaultOpen = false,
}: {
  title: string
  badge?: string | number
  amount?: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      border: '1px solid var(--modus-wc-color-base-200)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'var(--modus-wc-color-base-page)',
          border: 'none',
          cursor: 'pointer',
          gap: 8,
          fontFamily: 'Open Sans, sans-serif',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--modus-wc-color-base-content)' }}>
            {title}
          </span>
          {badge !== undefined && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 700,
              background: 'var(--modus-wc-color-base-100)',
              color: 'var(--modus-wc-color-base-content-low-contrast)',
              borderRadius: 99, padding: '1px 7px',
              border: '1px solid var(--modus-wc-color-base-200)',
            }}>
              {badge}
            </span>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {amount !== undefined && (
            <span style={{
              fontSize: '0.875rem', fontWeight: 700,
              color: 'var(--modus-wc-color-base-content)',
              background: 'var(--modus-wc-color-base-100)',
              border: '1px solid var(--modus-wc-color-base-200)',
              borderRadius: 6, padding: '2px 10px',
            }}>
              {fmt(amount)}
            </span>
          )}
          <ModusWcIcon
            name={open ? 'expand_less' : 'expand_more'}
            size="sm"
            decorative
            style={{ color: 'var(--modus-wc-color-base-content-low-contrast)' } as React.CSSProperties}
          />
        </span>
      </button>

      {open && (
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--modus-wc-color-base-200)',
          background: 'var(--modus-wc-color-base-page)',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Field components ─────────────────────────────────────────────────────────

const FIELD_STYLE: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 4,
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.03em',
  color: 'var(--modus-wc-color-base-content-low-contrast)',
  textTransform: 'uppercase',
}

const INPUT_STYLE: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--modus-wc-color-base-200)',
  borderRadius: 6,
  fontFamily: 'Open Sans, sans-serif',
  fontSize: '0.875rem',
  background: 'var(--modus-wc-color-base-page)',
  color: 'var(--modus-wc-color-base-content)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={FIELD_STYLE}>
      <label style={LABEL_STYLE}>
        {label}{required && <span style={{ color: 'var(--modus-wc-color-danger, #da212c)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Line items accordion ─────────────────────────────────────────────────────

function LineItemSection({
  group,
  onChange,
}: {
  group: LineItemGroup
  onChange: (items: LineItem[]) => void
}) {
  const total = group.items.reduce((s, i) => s + i.qty * i.unitCost, 0)

  const addItem = () =>
    onChange([...group.items, { id: uid(), description: '', qty: 1, unit: 'ea', unitCost: 0 }])

  const updateItem = (id: string, patch: Partial<LineItem>) =>
    onChange(group.items.map((i) => (i.id === id ? { ...i, ...patch } : i)))

  const removeItem = (id: string) =>
    onChange(group.items.filter((i) => i.id !== id))

  return (
    <Accordion
      title={group.category}
      badge={group.items.length}
      amount={total}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {group.items.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content-low-contrast)', margin: 0 }}>
            No {group.category.toLowerCase()} items yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px 80px 100px 32px',
              gap: 8,
              padding: '0 0 4px',
              borderBottom: '1px solid var(--modus-wc-color-base-200)',
            }}>
              {['Description', 'Qty', 'Unit', 'Unit Cost', ''].map((h) => (
                <span key={h} style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
                  {h}
                </span>
              ))}
            </div>

            {group.items.map((item) => (
              <div key={item.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 70px 80px 100px 32px',
                gap: 8,
                alignItems: 'center',
              }}>
                <input
                  style={INPUT_STYLE}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                />
                <input
                  style={{ ...INPUT_STYLE, textAlign: 'right' }}
                  type="number"
                  min={0}
                  value={item.qty}
                  onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) })}
                />
                <input
                  style={INPUT_STYLE}
                  placeholder="ea"
                  value={item.unit}
                  onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                />
                <input
                  style={{ ...INPUT_STYLE, textAlign: 'right' }}
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.unitCost}
                  onChange={(e) => updateItem(item.id, { unitCost: Number(e.target.value) })}
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--modus-wc-color-base-content-low-contrast)',
                    display: 'flex', alignItems: 'center', padding: 4,
                    borderRadius: 4,
                  }}
                  aria-label="Remove item"
                >
                  <ModusWcIcon name="close" size="xs" decorative />
                </button>
              </div>
            ))}

            {/* Row total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid var(--modus-wc-color-base-200)' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--modus-wc-color-base-content)' }}>
                Subtotal: {fmt(total)}
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={addItem}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none',
            border: '1px dashed var(--modus-wc-color-base-200)',
            borderRadius: 6,
            padding: '0.4rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            color: 'var(--modus-wc-color-primary)',
            fontFamily: 'Open Sans, sans-serif',
          }}
        >
          <ModusWcIcon name="add" size="xs" decorative />
          Add {group.category} item
        </button>
      </div>
    </Accordion>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  id,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <label
      htmlFor={id}
      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
    >
      <div
        role="switch"
        aria-checked={checked}
        style={{
          position: 'relative',
          width: 36,
          height: 20,
          borderRadius: 99,
          background: checked ? 'var(--modus-wc-color-primary)' : 'var(--modus-wc-color-base-300, #adb5bd)',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
        onClick={() => onChange(!checked)}
      >
        <div style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
        <input id={id} type="checkbox" checked={checked} onChange={() => onChange(!checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      </div>
      <span style={{ fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
        {label}
      </span>
    </label>
  )
}

// ─── Cost summary row ─────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  bold,
  large,
  children,
  indent,
}: {
  label: string
  value?: string
  bold?: boolean
  large?: boolean
  children?: React.ReactNode
  indent?: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 0',
      borderTop: bold ? '1px solid var(--modus-wc-color-base-200)' : undefined,
      marginTop: bold ? 4 : 0,
      paddingLeft: indent ? 16 : 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: large ? '1rem' : '0.875rem',
          fontWeight: bold ? 700 : 400,
          color: bold ? 'var(--modus-wc-color-base-content)' : 'var(--modus-wc-color-base-content-low-contrast)',
        }}>
          {label}
        </span>
        {children}
      </div>
      {value !== undefined && (
        <span style={{
          fontSize: large ? '1rem' : '0.875rem',
          fontWeight: bold ? 700 : 400,
          color: bold ? 'var(--modus-wc-color-base-content)' : 'var(--modus-wc-color-base-content)',
          minWidth: 100,
          textAlign: 'right',
        }}>
          {value}
        </span>
      )}
    </div>
  )
}

// ─── NewJobPage ───────────────────────────────────────────────────────────────

const INITIAL_GROUPS: LineItemGroup[] = [
  {
    category: 'Materials',
    icon: 'category',
    items: [
      { id: uid(), description: 'Topsoil', qty: 10, unit: 'yd³', unitCost: 1800 },
      { id: uid(), description: 'Sod', qty: 5000, unit: 'sq ft', unitCost: 0.8 },
      { id: uid(), description: 'Mulch', qty: 8, unit: 'yd³', unitCost: 850 },
    ],
  },
  {
    category: 'Labor',
    icon: 'person',
    items: [
      { id: uid(), description: 'Crew — site prep & install', qty: 40, unit: 'hr', unitCost: 700.0055 },
    ],
  },
  { category: 'Subcontract', icon: 'handshake', items: [] },
  { category: 'Equipment',   icon: 'construction', items: [] },
  { category: 'Other',       icon: 'add_circle', items: [] },
]

export default function NewJobPage() {
  const navigate = useNavigate()
  const taxToggleId = useId()
  const { checkDate } = usePeriodsContext()

  // ── Proposal Details
  const [proposalName, setProposalName] = useState('Amazon Landscaping')
  const [startDate, setStartDate]       = useState('2026-06-01')
  const [endDate, setEndDate]           = useState('2026-06-30')

  const startDateError = checkDate(startDate)
  const endDateError   = checkDate(endDate)
  const hasDateError   = startDateError !== null || endDateError !== null
  const [addr1, setAddr1]               = useState('440 Terry Avenue North')
  const [addr2, setAddr2]               = useState('')
  const [city, setCity]                 = useState('Seattle')
  const [state, setState]               = useState('WA')
  const [zip, setZip]                   = useState('98109')

  // ── Customer Details
  const [customerName, setCustomerName] = useState('')
  const [contactName, setContactName]   = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // ── Line items
  const [groups, setGroups] = useState<LineItemGroup[]>(INITIAL_GROUPS)

  const updateGroup = (category: LineItemCategory, items: LineItem[]) =>
    setGroups((gs) => gs.map((g) => (g.category === category ? { ...g, items } : g)))

  // ── Payment Terms
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [depositPct, setDepositPct]     = useState(0)

  // ── Cost summary
  const [markup, setMarkup]                   = useState(0)
  const [discount, setDiscount]               = useState(0)
  const [taxOverride, setTaxOverride]         = useState(false)
  const [manualTax, setManualTax]             = useState<string>('')

  const estimatedCosts = groups.reduce(
    (sum, g) => sum + g.items.reduce((s, i) => s + i.qty * i.unitCost, 0),
    0,
  )
  const afterMarkup        = estimatedCosts + markup
  const autoTax            = afterMarkup * TAX_RATE
  const taxValue           = taxOverride ? (parseFloat(manualTax) || 0) : autoTax
  const proposedContract   = afterMarkup + taxValue
  const contractWithDisc   = proposedContract - discount

  return (
    <div className="hub-page" style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              color: 'var(--modus-wc-color-base-content-low-contrast)', display: 'flex', alignItems: 'center',
              borderRadius: 6,
            }}
            aria-label="Back to jobs"
          >
            <ModusWcIcon name="arrow_back" size="sm" decorative />
          </button>
          <h1 className="hub-title" style={{ margin: 0, fontSize: '1.25rem' }}>Add a New Job</h1>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--modus-wc-color-base-content)' }}>Summary</p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
          Review your proposal. Select any sections you wish to edit.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); navigate('/jobs') }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >

        {/* ── Proposal Details ─────────────────────────────────────────── */}
        <div>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{
              fontSize: '0.875rem', fontWeight: 700,
              color: 'var(--modus-wc-color-primary)', cursor: 'pointer',
            }}>
              Proposal Details
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <Field label="Proposal Name" required>
              <input style={INPUT_STYLE} value={proposalName} onChange={(e) => setProposalName(e.target.value)} placeholder="e.g. Amazon Landscaping" required />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <Field label="Estimated Start">
                <input
                  style={{ ...INPUT_STYLE, borderColor: startDateError ? 'var(--modus-wc-color-danger, #da212c)' : undefined }}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {startDateError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <ModusWcIcon name="error" size="xs" decorative style={{ color: 'var(--modus-wc-color-danger, #da212c)', flexShrink: 0 } as React.CSSProperties} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--modus-wc-color-danger, #da212c)' }}>
                      {startDateError.periodLabel} is closed — choose a date in an open period.
                    </span>
                  </div>
                )}
              </Field>
              <Field label="Estimated End">
                <input
                  style={{ ...INPUT_STYLE, borderColor: endDateError ? 'var(--modus-wc-color-danger, #da212c)' : undefined }}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                {endDateError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <ModusWcIcon name="error" size="xs" decorative style={{ color: 'var(--modus-wc-color-danger, #da212c)', flexShrink: 0 } as React.CSSProperties} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--modus-wc-color-danger, #da212c)' }}>
                      {endDateError.periodLabel} is closed — choose a date in an open period.
                    </span>
                  </div>
                )}
              </Field>
            </div>

            <Field label="Job Address 1">
              <input style={INPUT_STYLE} value={addr1} onChange={(e) => setAddr1(e.target.value)} placeholder="Street address" />
            </Field>

            <Field label="Job Address 2">
              <input style={INPUT_STYLE} value={addr2} onChange={(e) => setAddr2(e.target.value)} placeholder="Suite, floor, etc. (optional)" />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: '0.875rem' }}>
              <Field label="City">
                <input style={INPUT_STYLE} value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
              </Field>
              <Field label="State">
                <input style={INPUT_STYLE} value={state} onChange={(e) => setState(e.target.value)} placeholder="WA" maxLength={2} />
              </Field>
              <Field label="Zip">
                <input style={INPUT_STYLE} value={zip} onChange={(e) => setZip(e.target.value)} placeholder="98101" />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Customer Details ─────────────────────────────────────────── */}
        <Accordion title="Customer Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <Field label="Customer / Company Name" required>
              <input style={INPUT_STYLE} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Amazon" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <Field label="Primary Contact Name">
                <input style={INPUT_STYLE} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Contact Phone">
                <input style={INPUT_STYLE} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="(206) 555-0100" type="tel" />
              </Field>
            </div>
            <Field label="Contact Email">
              <input style={INPUT_STYLE} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@company.com" type="email" />
            </Field>
          </div>
        </Accordion>

        {/* ── Billing Address ──────────────────────────────────────────── */}
        <Accordion title="Address">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <Field label="Billing Address 1">
              <input style={INPUT_STYLE} placeholder="Street address" />
            </Field>
            <Field label="Billing Address 2">
              <input style={INPUT_STYLE} placeholder="Suite, floor, etc. (optional)" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: '0.875rem' }}>
              <Field label="City"><input style={INPUT_STYLE} placeholder="City" /></Field>
              <Field label="State"><input style={INPUT_STYLE} placeholder="WA" maxLength={2} /></Field>
              <Field label="Zip"><input style={INPUT_STYLE} placeholder="98101" /></Field>
            </div>
          </div>
        </Accordion>

        {/* ── Estimated Items ──────────────────────────────────────────── */}
        <div>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--modus-wc-color-primary)' }}>
              Estimated Items
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {groups.map((g) => (
              <LineItemSection
                key={g.category}
                group={g}
                onChange={(items) => updateGroup(g.category, items)}
              />
            ))}
          </div>
        </div>

        {/* ── Payment Terms ─────────────────────────────────────────────── */}
        <Accordion title="Payment Terms">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <Field label="Terms">
              <select
                style={INPUT_STYLE}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt', 'Milestone-based'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Deposit Required (%)">
              <input
                style={{ ...INPUT_STYLE, maxWidth: 120 }}
                type="number" min={0} max={100} step={1}
                value={depositPct}
                onChange={(e) => setDepositPct(Number(e.target.value))}
              />
            </Field>
          </div>
        </Accordion>

        {/* ── Cost Summary ─────────────────────────────────────────────── */}
        <div style={{
          border: '1px solid var(--modus-wc-color-base-200)',
          borderRadius: 8,
          padding: '1rem 1.25rem',
          background: 'var(--modus-wc-color-base-page)',
        }}>

          <SummaryRow label="Estimated Costs" value={fmt(estimatedCosts)} />

          {/* Markup */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>Markup</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>$</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={markup}
                onChange={(e) => setMarkup(Number(e.target.value))}
                style={{
                  ...INPUT_STYLE, width: 110, textAlign: 'right',
                  padding: '3px 8px', fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Sales Tax with override toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.625rem 0',
            background: taxOverride ? 'color-mix(in srgb, var(--modus-wc-color-primary) 5%, transparent)' : 'transparent',
            borderRadius: 6,
            margin: '0 -0.25rem',
            paddingLeft: taxOverride ? '0.25rem' : 0,
            paddingRight: taxOverride ? '0.25rem' : 0,
            transition: 'background 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>
                Sales Tax
              </span>
              {!taxOverride && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
                  color: 'var(--modus-wc-color-base-content-low-contrast)',
                  background: 'var(--modus-wc-color-base-100)',
                  border: '1px solid var(--modus-wc-color-base-200)',
                  borderRadius: 4, padding: '1px 6px',
                }}>
                  AUTO {(TAX_RATE * 100).toFixed(1)}%
                </span>
              )}
              {taxOverride && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
                  color: 'var(--modus-wc-color-primary)',
                  background: 'color-mix(in srgb, var(--modus-wc-color-primary) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--modus-wc-color-primary) 30%, transparent)',
                  borderRadius: 4, padding: '1px 6px',
                }}>
                  MANUAL
                </span>
              )}
              <Toggle
                id={taxToggleId}
                checked={taxOverride}
                onChange={(v) => {
                  setTaxOverride(v)
                  if (v) setManualTax(autoTax.toFixed(2))
                }}
                label="Override"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>$</span>
              {taxOverride ? (
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={manualTax}
                  onChange={(e) => setManualTax(e.target.value)}
                  style={{
                    ...INPUT_STYLE, width: 110, textAlign: 'right',
                    padding: '3px 8px', fontSize: '0.875rem',
                    borderColor: 'var(--modus-wc-color-primary)',
                    boxShadow: '0 0 0 2px color-mix(in srgb, var(--modus-wc-color-primary) 15%, transparent)',
                  }}
                  autoFocus
                />
              ) : (
                <span style={{
                  minWidth: 110, textAlign: 'right', display: 'block',
                  fontSize: '0.875rem', color: 'var(--modus-wc-color-base-content)',
                  padding: '3px 8px',
                }}>
                  {autoTax.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Divider before totals */}
          <div style={{ borderTop: '2px solid var(--modus-wc-color-base-200)', margin: '0.5rem 0' }} />

          <SummaryRow label="Proposed Contract Value" value={fmt(proposedContract)} bold large />

          {/* Discount */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0 0.5rem 16px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>Discount</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--modus-wc-color-base-content-low-contrast)' }}>$</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                style={{
                  ...INPUT_STYLE, width: 110, textAlign: 'right',
                  padding: '3px 8px', fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <SummaryRow label="Contract Value w/Discount" value={fmt(contractWithDisc)} bold large />
        </div>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 6,
              border: '1px solid var(--modus-wc-color-base-200)',
              background: 'transparent',
              fontFamily: 'Open Sans, sans-serif',
              fontSize: '0.875rem',
              cursor: 'pointer',
              color: 'var(--modus-wc-color-base-content)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={hasDateError}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: 6,
              border: 'none',
              background: hasDateError ? 'var(--modus-wc-color-base-200)' : 'var(--modus-wc-color-primary)',
              color: hasDateError ? 'var(--modus-wc-color-base-content-low-contrast)' : '#fff',
              fontFamily: 'Open Sans, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: hasDateError ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.15s',
            }}
          >
            <ModusWcIcon name="save" size="xs" decorative />
            Save Job
          </button>
        </div>
      </form>
    </div>
  )
}
