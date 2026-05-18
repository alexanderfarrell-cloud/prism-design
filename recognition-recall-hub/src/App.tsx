import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import {
  ModusWcThemeProvider,
  ModusWcNavbar,
  ModusWcSideNavigation,
  ModusWcMenu,
  ModusWcMenuItem,
} from '@trimble-oss/moduswebcomponents-react'
import DashboardHub from './pages/DashboardHub'
import JobHub from './pages/JobHub'
import NewJobPage from './pages/NewJobPage'
import BillingHub from './pages/BillingHub'
import CustomerHub from './pages/CustomerHub'
import ExpenseHub from './pages/ExpenseHub'
import VendorHub from './pages/VendorHub'
import PeriodWorkspacePage from './pages/PeriodWorkspacePage'
import ClosePeriodWizard from './pages/ClosePeriodWizard'
import ReopenPeriodWizard from './pages/ReopenPeriodWizard'
import AccountingHub from './pages/AccountingHub'
import ReportsHub from './pages/ReportsHub'
import { PeriodsProvider } from './context/PeriodsContext'

const SIDENAV_MAX_WIDTH = '256px'
const NAVBAR_HEIGHT = 56

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'home' },
  { path: '/customers', label: 'Customers', icon: 'contacts' },
  { path: '/jobs', label: 'Jobs', icon: 'assignment' },
  { path: '/vendors', label: 'Vendors', icon: 'business' },
  { path: '/expenses', label: 'Expenses', icon: 'credit_card' },
  { path: '/billing', label: 'Billings', icon: 'receipt' },
  { path: '/accounting', label: 'Accounting', icon: 'account_balance' },
  { path: '/reports', label: 'Reports', icon: 'bar_chart' },
] as const

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sideNavExpanded, setSideNavExpanded] = useState(false)


  const handleExpandedChange = (e: Event) => {
    setSideNavExpanded((e as CustomEvent<boolean>).detail)
  }

  const handleMainMenuOpenChange = (e: Event) => {
    setSideNavExpanded((e as CustomEvent<boolean>).detail)
  }

  return (
    <ModusWcThemeProvider>
      <div className="app-shell">
        {/* ── Navbar ──────────────────────────────────────────────────── */}
        <ModusWcNavbar
          appTitle="Prism"
          mainMenuOpen={sideNavExpanded}
          onMainMenuOpenChange={handleMainMenuOpenChange}
          visibility={{
            logo: true,
            mainMenu: true,
            apps: false,
            search: false,
            searchInput: false,
            notifications: true,
            help: true,
            user: true,
            ai: false,
          }}
          userCard={{
            name: 'Alex Johnson',
            email: 'ajohnson@trimble.com',
            avatarAlt: 'AJ',
          }}
          customClass="sticky top-0"
          style={{ zIndex: 120 } as React.CSSProperties}
          onNotificationsClick={() => {}}
          onHelpClick={() => {}}
        />

        {/* ── Body row ────────────────────────────────────────────────── */}
        <div className="app-body">
          {/* Fixed side rail */}
          <div
            className={`rail-wrapper${sideNavExpanded ? ' rail-expanded' : ''}`}
            style={{
              top: NAVBAR_HEIGHT,
              height: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
              zIndex: 130,
            }}
          >
            <ModusWcSideNavigation
              expanded={sideNavExpanded}
              mode="overlay"
              maxWidth={SIDENAV_MAX_WIDTH}
              targetContent="#main-content"
              collapseOnClickOutside
              onExpandedChange={handleExpandedChange}
              customClass="app-sidenav"
              style={{ height: '100%' } as React.CSSProperties}
            >
              <ModusWcMenu size="lg">
                {NAV_ITEMS.map(({ path, label, icon }) => {
                  const isAccounting = path === '/accounting'
                  const selected = isAccounting
                    ? location.pathname.startsWith('/accounting') || location.pathname.startsWith('/periods')
                    : location.pathname === path
                  return (
                    <ModusWcMenuItem
                      key={path}
                      label={label}
                      selected={selected}
                      onItemSelect={() => { navigate(path); setSideNavExpanded(false) }}
                    />
                  )
                })}
              </ModusWcMenu>
            </ModusWcSideNavigation>
          </div>

          {/* Main scrollable area */}
          <main id="main-content">
            <PeriodsProvider>
              <Routes>
                <Route path="/" element={<DashboardHub />} />
                <Route path="/jobs" element={<JobHub />} />
                <Route path="/jobs/new" element={<NewJobPage />} />
                <Route path="/billing" element={<BillingHub />} />
                <Route path="/customers" element={<CustomerHub />} />
                <Route path="/expenses" element={<ExpenseHub />} />
                <Route path="/vendors" element={<VendorHub />} />
                <Route path="/accounting" element={<AccountingHub />} />
                <Route path="/periods" element={<PeriodWorkspacePage />} />
                <Route path="/periods/close" element={<ClosePeriodWizard />} />
                <Route path="/periods/reopen" element={<ReopenPeriodWizard />} />
                <Route path="/reports" element={<ReportsHub />} />
              </Routes>
            </PeriodsProvider>
          </main>
        </div>
      </div>
    </ModusWcThemeProvider>
  )
}
