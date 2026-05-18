import React from "react"
import { useNavigate } from "react-router-dom"
import { ModusWcIcon } from "@trimble-oss/moduswebcomponents-react"
import { usePeriodsContext } from "../context/PeriodsContext"
import type { FiscalPeriod } from "../data/periods"

function MonthCard({ period }: { period: FiscalPeriod }) {
  const navigate = useNavigate()
  const isClosed = period.status === "closed"
  const monthShort = period.label.split(" ")[0]
  return (
    <div style={{
      border: `1px solid ${isClosed ? "var(--modus-wc-color-base-200)" : "var(--modus-wc-color-base-200)"}`,
      borderRadius: 10,
      padding: "1rem",
      background: isClosed ? "var(--modus-wc-color-base-100)" : "var(--modus-wc-color-base-page)",
      display: "flex", flexDirection: "column", gap: 10,
      opacity: isClosed ? 0.75 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--modus-wc-color-base-content)" }}>{monthShort}</span>
        <ModusWcIcon
          name={isClosed ? "lock" : "lock_open"}
          size="xs"
          decorative
          style={{ color: isClosed ? "var(--modus-wc-color-base-content-low-contrast)" : "var(--modus-wc-color-success, #006638)" } as React.CSSProperties}
        />
      </div>
      <span style={{
        display: "inline-flex", alignItems: "center", padding: "2px 8px",
        borderRadius: 99, fontSize: "0.65rem", fontWeight: 700,
        background: isClosed ? "var(--modus-wc-color-base-200)" : "color-mix(in srgb, var(--modus-wc-color-success, #006638) 12%, transparent)",
        color: isClosed ? "var(--modus-wc-color-base-content-low-contrast)" : "var(--modus-wc-color-success, #006638)",
        width: "fit-content",
      }}>
        {isClosed ? "Closed" : "Open"}
      </span>
      <button
        onClick={() => navigate(isClosed ? `/periods/reopen?id=${period.id}` : `/periods/close?id=${period.id}`)}
        style={{
          padding: "5px 0", borderRadius: 6, fontSize: "0.75rem", cursor: "pointer",
          border: isClosed ? "1px solid var(--modus-wc-color-base-200)" : "1px solid var(--modus-wc-color-primary)",
          background: "transparent",
          color: isClosed ? "var(--modus-wc-color-base-content)" : "var(--modus-wc-color-primary)",
          fontFamily: "Open Sans, sans-serif",
          fontWeight: isClosed ? 400 : 600,
        }}
      >
        {isClosed ? "Re-open" : "Close"}
      </button>
    </div>
  )
}

export default function PeriodWorkspacePage() {
  const navigate = useNavigate()
  const { periods } = usePeriodsContext()
  const today = new Date()
  const openCount = periods.filter((p) => p.status === "open").length
  const closedCount = periods.filter((p) => p.status === "closed").length
  const currentPeriod = periods.find((p) => new Date(p.startDate) <= today && new Date(p.endDate) >= today)
  const years = [...new Set(periods.map((p) => p.year))].sort()

  return (
    <div className="hub-page">
      <div style={{ flexShrink: 0 }}>
        <h1 className="hub-title">
          <ModusWcIcon name="calendar_today" size="md" decorative />
          Fiscal Periods
        </h1>
      </div>

      <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--modus-wc-color-base-content-low-contrast)" }}>
        Close months to lock your books. Re-open them any time to make corrections.
      </p>

      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">Current Period</span>
          <span className="kpi-value" style={{ fontSize: "1.1rem" }}>{currentPeriod?.label ?? "—"}</span>
          <span className="kpi-sub">Active accounting month</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Open Periods</span>
          <span className="kpi-value kpi-value--success">{openCount}</span>
          <span className="kpi-sub">Transactions allowed</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Closed Periods</span>
          <span className="kpi-value">{closedCount}</span>
          <span className="kpi-sub">Locked from changes</span>
        </div>
      </div>

      {years.map((year) => (
        <div key={year}>
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", fontWeight: 700, color: "var(--modus-wc-color-base-content-low-contrast)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{year}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.75rem" }}>
            {periods.filter((p) => p.year === year).map((period) => (
              <MonthCard key={period.id} period={period} />
            ))}
          </div>
        </div>
      ))}

      <div style={{ paddingTop: "0.5rem" }}>
        <button
          onClick={() => navigate('/accounting')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: 'var(--modus-wc-color-primary)', textDecoration: 'underline', padding: 0 }}
        >
          Back to Accounting
        </button>
      </div>
    </div>
  )
}