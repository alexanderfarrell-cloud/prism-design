export type PeriodStatus = "open" | "closed"

export interface FiscalPeriod {
  id: string
  year: number
  month: number
  label: string
  startDate: string
  endDate: string
  status: PeriodStatus
}

export interface ClosedPeriodError {
  code: "CLOSED_PERIOD"
  periodId: string
  periodLabel: string
  message: string
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function buildPeriod(year: number, month: number, status: PeriodStatus): FiscalPeriod {
  const mm = String(month).padStart(2, "0")
  const lastDay = daysInMonth(year, month)
  return {
    id: `${year}-${mm}`,
    year,
    month,
    label: `${MONTH_NAMES[month - 1]} ${year}`,
    startDate: `${year}-${mm}-01`,
    endDate: `${year}-${mm}-${String(lastDay).padStart(2, "0")}`,
    status,
  }
}

export const INITIAL_PERIODS: FiscalPeriod[] = (() => {
  const periods: FiscalPeriod[] = []
  for (let year = 2025; year <= 2026; year++) {
    for (let month = 1; month <= 12; month++) {
      const closed = year === 2025 && month <= 4
      periods.push(buildPeriod(year, month, closed ? "closed" : "open"))
    }
  }
  return periods
})()

export function getPeriodForDate(isoDate: string, periods: FiscalPeriod[]): FiscalPeriod | null {
  if (!isoDate) return null
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return null
  return periods.find((p) => d >= new Date(p.startDate) && d <= new Date(p.endDate)) ?? null
}

export function buildClosedPeriodError(period: FiscalPeriod): ClosedPeriodError {
  return {
    code: "CLOSED_PERIOD",
    periodId: period.id,
    periodLabel: period.label,
    message: `${period.label} is closed. Transactions cannot be created, edited, or deleted in a closed period.`,
  }
}

export function getPendingClosePeriods(periods: FiscalPeriod[], today: Date = new Date()): FiscalPeriod[] {
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() + 20)
  return periods.filter((p) => {
    if (p.status !== "open") return false
    const end = new Date(p.endDate)
    return end <= cutoff
  })
}
