import React from "react"
import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ModusWcIcon } from "@trimble-oss/moduswebcomponents-react"
import { usePeriodsContext } from "../context/PeriodsContext"
import type { FiscalPeriod } from "../data/periods"
import { INVOICES } from "./BillingHub"

type InvoiceAttentionStatus = "Overdue" | "Pending"

type UnresolvedInvoiceRow = {
  id: string
  label: string
  amount: number
  path: string
  status: InvoiceAttentionStatus
}

function getUnresolved(period: FiscalPeriod): UnresolvedInvoiceRow[] {
  const start = new Date(period.startDate)
  const end = new Date(period.endDate)
  const inRange = (d: string) => {
    const dt = new Date(d)
    return dt >= start && dt <= end
  }
  return INVOICES.filter(
    (i) => inRange(i.issuedDate) && (i.status === "Overdue" || i.status === "Pending")
  ).map((i) => ({
    id: i.id,
    label: i.jobName,
    amount: i.amount,
    path: "/billing",
    status: i.status as InvoiceAttentionStatus,
  }))
}

function countUnresolved(period: FiscalPeriod): number {
  return getUnresolved(period).length
}

function CalendarLockIllustration({ open = false }: { open?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <div style={{ width: 200, height: 200, borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%", background: "color-mix(in srgb, var(--modus-wc-color-primary) 8%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <ModusWcIcon name="calendar_today" size="lg" decorative style={{ color: "var(--modus-wc-color-primary)", opacity: 0.9 } as React.CSSProperties} />
            <ModusWcIcon name={open ? "lock_open" : "lock"} size="md" decorative style={{ color: "var(--modus-wc-color-primary)" } as React.CSSProperties} />
          </div>
        </div>
      </div>
    </div>
  )
}

function WizardShell({
  title, question, illustration, children, onCancel, onNext, nextLabel = "→", nextDisabled = false, showBack = false, onBack,
}: {
  title: string; question: string; illustration: React.ReactNode; children: React.ReactNode
  onCancel: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean
  showBack?: boolean; onBack?: () => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: "var(--modus-wc-color-base-page)" }}>
      <div style={{ padding: "1.5rem 2rem 1rem", borderBottom: "1px solid var(--modus-wc-color-base-200)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--modus-wc-color-base-content)", marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--modus-wc-color-base-content-low-contrast)" }}>{question}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "color-mix(in srgb, var(--modus-wc-color-primary) 8%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <ModusWcIcon name="lock" size="sm" decorative style={{ color: "var(--modus-wc-color-primary)" } as React.CSSProperties} />
          </div>
          <button onClick={onCancel} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, color: "var(--modus-wc-color-base-content-low-contrast)", display: "flex" }}>
            <ModusWcIcon name="close" size="sm" decorative />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", gap: 0, overflow: "hidden" }}>
        <div style={{ flex: 1, padding: "2rem", overflowY: "auto", minWidth: 0 }}>{children}</div>
        <div style={{ width: 320, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          {illustration}
        </div>
      </div>

      <div style={{ padding: "1.25rem 2rem", borderTop: "1px solid var(--modus-wc-color-base-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {showBack && (
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Open Sans, sans-serif", fontSize: "0.875rem", color: "var(--modus-wc-color-primary)", textDecoration: "underline", padding: 0 }}>Back</button>
          )}
        </div>
        {nextLabel === "→" ? (
          <button
            onClick={onNext}
            disabled={nextDisabled}
            style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: nextDisabled ? "var(--modus-wc-color-base-200)" : "var(--modus-wc-color-primary)", color: nextDisabled ? "var(--modus-wc-color-base-content-low-contrast)" : "#fff", cursor: nextDisabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
            aria-label="Next"
          >
            <ModusWcIcon name="arrow_forward" size="sm" decorative />
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={nextDisabled}
            style={{ padding: "0.625rem 1.5rem", borderRadius: 99, border: "none", background: nextDisabled ? "var(--modus-wc-color-base-200)" : "var(--modus-wc-color-primary)", color: nextDisabled ? "var(--modus-wc-color-base-content-low-contrast)" : "#fff", cursor: nextDisabled ? "not-allowed" : "pointer", fontFamily: "Open Sans, sans-serif", fontSize: "0.875rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s" }}
          >
            <ModusWcIcon name="lock" size="xs" decorative />
            Close period
          </button>
        )}
      </div>
    </div>
  )
}

function PeriodPickerCard({ period, selected, onClick }: { period: FiscalPeriod; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ textAlign: "left", cursor: "pointer", borderRadius: 10, padding: "1rem", border: selected ? "2px solid var(--modus-wc-color-primary)" : "1px solid var(--modus-wc-color-base-200)", background: selected ? "color-mix(in srgb, var(--modus-wc-color-primary) 6%, transparent)" : "var(--modus-wc-color-base-page)", fontFamily: "Open Sans, sans-serif", transition: "border 0.15s, background 0.15s", display: "flex", flexDirection: "column", gap: 6 }}
    >
      <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--modus-wc-color-base-content)" }}>{period.label.split(" ")[0]}</span>
      <span style={{ fontSize: "0.72rem", color: "var(--modus-wc-color-base-content-low-contrast)" }}>{period.year}</span>
      {selected && <ModusWcIcon name="check_circle" size="xs" decorative style={{ color: "var(--modus-wc-color-primary)" } as React.CSSProperties} />}
    </button>
  )
}

export default function ClosePeriodWizard() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { periods, closePeriod } = usePeriodsContext()
  const openPeriods = periods.filter((p) => p.status === "open")
  const preselect = params.get("id")
  const [step, setStep] = useState(preselect ? 2 : 1)
  const [selectedId, setSelectedId] = useState<string>(preselect ?? openPeriods[0]?.id ?? "")
  const [showConfirm, setShowConfirm] = useState(false)
  const selected = periods.find((p) => p.id === selectedId) ?? null
  const unresolved = selected ? countUnresolved(selected) : 0

  const cancel = () => navigate("/periods")

  const handleConfirmClose = () => {
    if (selected) { closePeriod(selected.id); setShowConfirm(false); setStep(3) }
  }

  if (step === 3) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", gap: "1.5rem", padding: "3rem", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "color-mix(in srgb, var(--modus-wc-color-success, #006638) 12%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ModusWcIcon name="check_circle" size="lg" decorative style={{ color: "var(--modus-wc-color-success, #006638)" } as React.CSSProperties} />
        </div>
        <div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--modus-wc-color-base-content)", marginBottom: 8 }}>
            {selected?.label} is now closed
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--modus-wc-color-base-content-low-contrast)", maxWidth: 380 }}>
            Your books for {selected?.label} are locked. No transactions can be created, edited, or deleted in this period.
          </div>
        </div>
        <button onClick={() => navigate("/periods")} style={{ padding: "0.5rem 1.5rem", borderRadius: 99, border: "none", background: "var(--modus-wc-color-primary)", color: "#fff", fontFamily: "Open Sans, sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
          Done
        </button>
      </div>
    )
  }

  if (step === 2) {
    return (
      <>
        {showConfirm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ background: "var(--modus-wc-color-base-page)", borderRadius: 16, padding: "2rem", maxWidth: 420, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", position: "relative" }}>
              <button
                onClick={() => setShowConfirm(false)}
                aria-label="Cancel"
                style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--modus-wc-color-base-200)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--modus-wc-color-base-content)" }}
              >
                <ModusWcIcon name="close" size="xs" decorative />
              </button>
              <div style={{ fontWeight: 300, fontSize: "1.125rem", color: "var(--modus-wc-color-base-content)", marginBottom: "0.75rem" }}>
                Close {selected?.label}?
              </div>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.9375rem", color: "var(--modus-wc-color-base-content-low-contrast)", lineHeight: 1.6 }}>
                Locks all transactions in <strong style={{ color: "var(--modus-wc-color-base-content)", fontWeight: 600 }}>{selected?.label}</strong>. You can re-open it later if needed.
              </p>
              <p style={{ margin: "0 0 1.5rem", fontSize: "0.875rem", color: "var(--modus-wc-color-base-content-low-contrast)", lineHeight: 1.6, padding: "0.75rem 1rem", background: "var(--modus-wc-color-base-100)", borderRadius: 8, border: "1px solid var(--modus-wc-color-base-200)" }}>
                <strong style={{ color: "var(--modus-wc-color-base-content)", fontWeight: 600 }}>Reminder:</strong> unpaid invoices in this period will be rolled into the next period if they are not collected before you close.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{ padding: "0.625rem 1.5rem", borderRadius: 99, border: "none", background: "var(--modus-wc-color-base-200)", color: "var(--modus-wc-color-base-content)", fontFamily: "Open Sans, sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClose}
                  style={{ padding: "0.625rem 1.5rem", borderRadius: 99, border: "none", background: "var(--modus-wc-color-primary)", color: "#fff", fontFamily: "Open Sans, sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <ModusWcIcon name="lock" size="xs" decorative />
                  Yes, close period
                </button>
              </div>
            </div>
          </div>
        )}
        <WizardShell
          title="Close a Period"
          question={`Ready to close ${selected?.label ?? "this period"}?`}
          illustration={<CalendarLockIllustration />}
          onCancel={cancel}
          onNext={() => setShowConfirm(true)}
          nextLabel="confirm"
          showBack
          onBack={() => navigate("/periods")}
        >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: 440 }}>
          <div style={{ background: "var(--modus-wc-color-base-page)", border: "1px solid var(--modus-wc-color-base-200)", borderRadius: 10, padding: "1.25rem", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "color-mix(in srgb, var(--modus-wc-color-primary) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ModusWcIcon name="calendar_today" size="sm" decorative style={{ color: "var(--modus-wc-color-primary)" } as React.CSSProperties} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--modus-wc-color-base-content)" }}>{selected?.label}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--modus-wc-color-base-content-low-contrast)" }}>{selected?.startDate} to {selected?.endDate}</div>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--modus-wc-color-base-content)" }}>
            Closing this period will <strong>lock all transactions</strong> in {selected?.label}. Nothing can be created, edited, or deleted in a closed period.
          </p>

          {(selected?.id === "2025-05" || selected?.id === "2025-06") && (
            <div style={{
              borderRadius: 10,
              border: "1.5px solid color-mix(in srgb, var(--modus-wc-color-danger, #da212c) 35%, transparent)",
              background: "color-mix(in srgb, var(--modus-wc-color-danger, #da212c) 8%, transparent)",
              padding: "1.25rem 1.25rem 1.25rem 1rem",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "color-mix(in srgb, var(--modus-wc-color-danger, #da212c) 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <ModusWcIcon name="warning" size="sm" decorative style={{ color: "var(--modus-wc-color-danger, #da212c)" } as React.CSSProperties} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--modus-wc-color-danger, #da212c)", marginBottom: 6 }}>
                  Transactions in this period are not fully posted
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--modus-wc-color-base-content)", lineHeight: 1.6 }}>
                  Some invoices or payments are still open. Closing now will lock the books as-is. You can re-open this period later if corrections are needed.
                </div>
              </div>
            </div>
          )}

          <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--modus-wc-color-base-content-low-contrast)" }}>
            You can re-open this period any time if corrections are needed.
          </p>
        </div>
      </WizardShell>
      </>
    )
  }

  return (
    <WizardShell
      title="Close a Period"
      question="Which month are you closing?"
      illustration={<CalendarLockIllustration />}
      onCancel={cancel}
      onNext={() => setStep(2)}
      nextDisabled={!selectedId}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--modus-wc-color-base-content-low-contrast)" }}>
          Select the month you want to close. Only open periods are shown.
        </p>
        {[2025, 2026].map((year) => {
          const rows = openPeriods.filter((p) => p.year === year)
          if (!rows.length) return null
          return (
            <div key={year}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--modus-wc-color-base-content-low-contrast)", marginBottom: "0.5rem" }}>{year}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.625rem" }}>
                {rows.map((p) => (
                  <PeriodPickerCard key={p.id} period={p} selected={selectedId === p.id} onClick={() => setSelectedId(p.id)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </WizardShell>
  )
}