import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ModusProvider from "./components/ModusProvider";
import { ThemeProvider } from "./contexts/ThemeContext";

import { DevPanelProvider, DevPanel, DevRoutes, isDevPanelEnabled } from "./dev";

import AppShell from "./layouts/AppShell";

import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import JobsPage from "./pages/JobsPage";
import VendorsPage from "./pages/VendorsPage";
import ExpensesPage from "./pages/ExpensesPage";
import BillingPage from "./pages/BillingPage";
import AccountingPage from "./pages/AccountingPage";
import ReportsPage from "./pages/ReportsPage";
import PayrollHomePage from "./pages/payroll/PayrollHomePage";
import PayrollEmployeesPage from "./pages/payroll/employees/PayrollEmployeesPage";
import PayrollEmployeeDetailsPage from "./pages/payroll/employees/PayrollEmployeeDetailsPage";
import PayrollEmployeeSectionPage from "./pages/payroll/employees/PayrollEmployeeSectionPage";
import PersonalInfoPage from "./pages/payroll/employees/sections/PersonalInfoPage";
import LaborTypePage from "./pages/payroll/employees/sections/LaborTypePage";
import PayTypePage from "./pages/payroll/employees/sections/PayTypePage";
import TimecardPage from "./pages/payroll/employees/sections/TimecardPage";
import TimecardDetailPage from "./pages/payroll/timesheets/TimecardDetailPage";
import AddShiftPage from "./pages/payroll/timesheets/AddShiftPage";
import PayrollTaxSettingsPage from "./pages/payroll/PayrollTaxSettingsPage";
import PayrollCompliancePage from "./pages/payroll/PayrollCompliancePage";
import PayrollDocumentsPage from "./pages/payroll/PayrollDocumentsPage";
import PayrollLaborClassesPage from "./pages/payroll/PayrollLaborClassesPage";
import LaborCategoryDetailPage from "./pages/payroll/LaborCategoryDetailPage";
import LaborTypeDetailPage from "./pages/payroll/LaborTypeDetailPage";
import PayrollTimesheetsPage from "./pages/payroll/timesheets/PayrollTimesheetsPage";
import PayrollOnboardingPage from "./pages/payroll/onboarding/PayrollOnboardingPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const showDevPanel = isDevPanelEnabled();

  return (
    <ThemeProvider>
      <ModusProvider>
        <DevPanelProvider>
            <Router basename={import.meta.env.BASE_URL}>
              <Routes>
                {showDevPanel && <Route path="/dev/*" element={<DevRoutes />} />}

                <Route path="payroll/setup" element={<PayrollOnboardingPage />} />

                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="job-hub" element={<JobsPage />} />
                  <Route path="vendors" element={<VendorsPage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="job-billing" element={<BillingPage />} />
                  <Route path="accounting" element={<AccountingPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="payroll" element={<PayrollHomePage />} />
                  <Route path="payroll/employees" element={<PayrollEmployeesPage />} />
                  <Route path="payroll/employees/:employeeId" element={<PayrollEmployeeDetailsPage />} />
                  <Route path="payroll/employees/:employeeId/personal-info" element={<PersonalInfoPage />} />
                  <Route path="payroll/employees/:employeeId/labor-type" element={<LaborTypePage />} />
                  <Route path="payroll/employees/:employeeId/pay-type" element={<PayTypePage />} />
                  <Route path="payroll/employees/:employeeId/timecard" element={<TimecardPage />} />
                  <Route path="payroll/employees/:employeeId/:sectionId" element={<PayrollEmployeeSectionPage />} />
                  <Route path="payroll/timesheets" element={<PayrollTimesheetsPage />} />
                  <Route path="payroll/timesheets/:employeeId/add-shift" element={<AddShiftPage />} />
                  <Route path="payroll/timesheets/:employeeId/:dayIndex" element={<TimecardDetailPage />} />
                  <Route path="payroll/tax-settings" element={<PayrollTaxSettingsPage />} />
                  <Route path="payroll/compliance" element={<PayrollCompliancePage />} />
                  <Route path="payroll/documents" element={<PayrollDocumentsPage />} />
                  <Route path="payroll/labor-classes" element={<PayrollLaborClassesPage />} />
                  <Route path="payroll/labor-classes/:categoryId" element={<LaborCategoryDetailPage />} />
                  <Route path="payroll/labor-classes/:categoryId/:laborTypeId" element={<LaborTypeDetailPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>

              {showDevPanel && <DevPanel />}
            </Router>
          </DevPanelProvider>
      </ModusProvider>
    </ThemeProvider>
  );
}

export default App;
