import React, { createContext, useContext, useState } from "react"
import type { FiscalPeriod, ClosedPeriodError } from "../data/periods"
import { INITIAL_PERIODS, getPeriodForDate, buildClosedPeriodError } from "../data/periods"

interface PeriodsContextValue {
  periods: FiscalPeriod[]
  closePeriod: (id: string) => void
  reopenPeriod: (id: string) => void
  checkDate: (isoDate: string) => ClosedPeriodError | null
}

const PeriodsContext = createContext<PeriodsContextValue | null>(null)

export function PeriodsProvider({ children }: { children: React.ReactNode }) {
  const [periods, setPeriods] = useState<FiscalPeriod[]>(INITIAL_PERIODS)

  const closePeriod = (id: string) =>
    setPeriods((ps) => ps.map((p) => (p.id === id ? { ...p, status: "closed" } : p)))

  const reopenPeriod = (id: string) =>
    setPeriods((ps) => ps.map((p) => (p.id === id ? { ...p, status: "open" } : p)))

  const checkDate = (isoDate: string): ClosedPeriodError | null => {
    const period = getPeriodForDate(isoDate, periods)
    if (period && period.status === "closed") return buildClosedPeriodError(period)
    return null
  }

  return (
    <PeriodsContext.Provider value={{ periods, closePeriod, reopenPeriod, checkDate }}>
      {children}
    </PeriodsContext.Provider>
  )
}

export function usePeriodsContext(): PeriodsContextValue {
  const ctx = useContext(PeriodsContext)
  if (!ctx) throw new Error("usePeriodsContext must be used within PeriodsProvider")
  return ctx
}
