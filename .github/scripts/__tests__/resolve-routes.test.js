import { describe, it, expect } from "vitest";
import {
  buildSlugToComponentMap,
  buildComponentToRouteMap,
  buildComponentToSourceMap,
  findParentListingRoute,
  resolveRoutes,
} from "../resolve-routes.js";

const SAMPLE_APP = `
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import PayrollOnboardingPage from "./pages/payroll/onboarding/PayrollOnboardingPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

<Route path="payroll/setup" element={<PayrollOnboardingPage />} />
<Route element={<AppShell />}>
  <Route index element={<DashboardPage />} />
  <Route path="dashboard" element={<DashboardPage />} />
  <Route path="customers" element={<CustomersPage />} />
  <Route path="settings" element={<SettingsPage />} />
  <Route path="*" element={<NotFoundPage />} />
</Route>
`;

const PAYROLL_APP = `
import PayrollHomePage from "./pages/payroll/PayrollHomePage";
import PayrollTaxSettingsPage from "./pages/payroll/PayrollTaxSettingsPage";
import PayrollEmployeesPage from "./pages/payroll/employees/PayrollEmployeesPage";
import PayrollEmployeeDetailsPage from "./pages/payroll/employees/PayrollEmployeeDetailsPage";
import PersonalInfoPage from "./pages/payroll/employees/sections/PersonalInfoPage";
import LaborTypePage from "./pages/payroll/employees/sections/LaborTypePage";
import PayrollOnboardingPage from "./pages/payroll/onboarding/PayrollOnboardingPage";

<Route path="payroll" element={<PayrollHomePage />} />
<Route path="payroll/tax-settings" element={<PayrollTaxSettingsPage />} />
<Route path="payroll/employees" element={<PayrollEmployeesPage />} />
<Route path="payroll/employees/:employeeId" element={<PayrollEmployeeDetailsPage />} />
<Route path="payroll/employees/:employeeId/personal-info" element={<PersonalInfoPage />} />
<Route path="payroll/employees/:employeeId/labor-type" element={<LaborTypePage />} />
<Route path="payroll/setup" element={<PayrollOnboardingPage />} />
`;

describe("buildSlugToComponentMap", () => {
  it("maps top-level page slug to component name array", () => {
    const map = buildSlugToComponentMap(SAMPLE_APP);
    expect(map.get("dashboard-page")).toEqual(["DashboardPage"]);
    expect(map.get("customers-page")).toEqual(["CustomersPage"]);
    expect(map.get("settings-page")).toEqual(["SettingsPage"]);
  });

  it("maps directory-based slug to component name array", () => {
    const map = buildSlugToComponentMap(SAMPLE_APP);
    expect(map.get("payroll-onboarding")).toEqual(["PayrollOnboardingPage"]);
  });

  it("maps not-found-page slug to component name array", () => {
    const map = buildSlugToComponentMap(SAMPLE_APP);
    expect(map.get("not-found-page")).toEqual(["NotFoundPage"]);
  });

  it("returns empty map for content with no page imports", () => {
    const content = `import React from "react";`;
    const map = buildSlugToComponentMap(content);
    expect(map.size).toBe(0);
  });

  it("handles single-quoted imports", () => {
    const content = `import FooPage from './pages/FooPage';`;
    const map = buildSlugToComponentMap(content);
    expect(map.get("foo-page")).toEqual(["FooPage"]);
  });

  it("handles imports with .tsx extension", () => {
    const content = `import FooPage from "./pages/FooPage.tsx";`;
    const map = buildSlugToComponentMap(content);
    expect(map.get("foo-page")).toEqual(["FooPage"]);
  });

  it("collects all components when multiple files produce the same slug", () => {
    const content = `
import FooPage from "./pages/FooPage";
import FooPage2 from "./pages/foo-page/FooPage2";
`;
    const map = buildSlugToComponentMap(content);
    expect(map.get("foo-page")).toEqual(["FooPage", "FooPage2"]);
  });

  it("maps nested imports to depth-2 slug", () => {
    const content = `
import PayrollHomePage from "./pages/payroll/PayrollHomePage";
import PayrollEmployeesPage from "./pages/payroll/employees/PayrollEmployeesPage";
import PersonalInfoPage from "./pages/payroll/employees/sections/PersonalInfoPage";
`;
    const map = buildSlugToComponentMap(content);
    expect(map.get("payroll")).toEqual(["PayrollHomePage"]);
    expect(map.get("payroll-employees")).toEqual([
      "PayrollEmployeesPage",
      "PersonalInfoPage",
    ]);
  });
});

describe("buildComponentToRouteMap", () => {
  it("maps component to its route path", () => {
    const map = buildComponentToRouteMap(SAMPLE_APP);
    expect(map.get("PayrollOnboardingPage")).toBe("/payroll/setup");
    expect(map.get("CustomersPage")).toBe("/customers");
    expect(map.get("SettingsPage")).toBe("/settings");
  });

  it("excludes wildcard routes", () => {
    const map = buildComponentToRouteMap(SAMPLE_APP);
    expect(map.get("NotFoundPage")).toBeUndefined();
  });

  it("prefers named route over index route for same component", () => {
    const map = buildComponentToRouteMap(SAMPLE_APP);
    expect(map.get("DashboardPage")).toBe("/dashboard");
  });

  it("falls back to index route when no named route exists", () => {
    const content = `<Route index element={<HomePage />} />`;
    const map = buildComponentToRouteMap(content);
    expect(map.get("HomePage")).toBe("/");
  });

  it("returns empty map when no routes exist", () => {
    const content = `<div>no routes</div>`;
    const map = buildComponentToRouteMap(content);
    expect(map.size).toBe(0);
  });

  it("normalizes leading slash", () => {
    const content = `<Route path="/already-slashed" element={<TestPage />} />`;
    const map = buildComponentToRouteMap(content);
    expect(map.get("TestPage")).toBe("/already-slashed");
  });

  it("adds leading slash to relative paths", () => {
    const content = `<Route path="relative" element={<TestPage />} />`;
    const map = buildComponentToRouteMap(content);
    expect(map.get("TestPage")).toBe("/relative");
  });

  it("handles element before path (reversed attribute order)", () => {
    const content = `<Route element={<ReversedPage />} path="reversed" />`;
    const map = buildComponentToRouteMap(content);
    expect(map.get("ReversedPage")).toBe("/reversed");
  });

  it("handles extra attributes between path and element", () => {
    const content = `<Route path="extra" className="foo" element={<ExtraPage />} />`;
    const map = buildComponentToRouteMap(content);
    expect(map.get("ExtraPage")).toBe("/extra");
  });

  it("handles index route with reversed attribute order", () => {
    const content = `<Route element={<ReversedIndex />} index />`;
    const map = buildComponentToRouteMap(content);
    expect(map.get("ReversedIndex")).toBe("/");
  });
});

describe("buildComponentToSourceMap", () => {
  it("maps component names to normalized source paths", () => {
    const content = `
import DashboardPage from "./pages/DashboardPage";
import PayrollEmployeesPage from "./pages/payroll/employees/PayrollEmployeesPage";
import PersonalInfoPage from "./pages/payroll/employees/sections/PersonalInfoPage";
`;
    const map = buildComponentToSourceMap(content);
    expect(map.get("DashboardPage")).toBe("src/pages/DashboardPage");
    expect(map.get("PayrollEmployeesPage")).toBe(
      "src/pages/payroll/employees/PayrollEmployeesPage"
    );
    expect(map.get("PersonalInfoPage")).toBe(
      "src/pages/payroll/employees/sections/PersonalInfoPage"
    );
  });

  it("strips .tsx extension from import path", () => {
    const content = `import FooPage from "./pages/FooPage.tsx";`;
    const map = buildComponentToSourceMap(content);
    expect(map.get("FooPage")).toBe("src/pages/FooPage");
  });

  it("returns empty map for no page imports", () => {
    const content = `import React from "react";`;
    const map = buildComponentToSourceMap(content);
    expect(map.size).toBe(0);
  });
});

describe("findParentListingRoute", () => {
  it("finds parent listing route for dynamic route", () => {
    const routes = ["/payroll/employees", "/payroll/employees/:id", "/payroll/employees/:id/edit"];
    expect(findParentListingRoute("/payroll/employees/:id", routes)).toBe("/payroll/employees");
    expect(findParentListingRoute("/payroll/employees/:id/edit", routes)).toBe("/payroll/employees");
  });

  it("returns null when parent route does not exist", () => {
    const routes = ["/payroll/employees/:id"];
    expect(findParentListingRoute("/payroll/employees/:id", routes)).toBeNull();
  });

  it("returns null for routes without dynamic segments", () => {
    const routes = ["/payroll/employees"];
    expect(findParentListingRoute("/payroll/employees", routes)).toBeNull();
  });

  it("handles root-level dynamic routes", () => {
    const routes = ["/", "/:id"];
    expect(findParentListingRoute("/:id", routes)).toBeNull();
  });

  it("finds correct parent for deeply nested dynamic route", () => {
    const routes = ["/payroll", "/payroll/employees", "/payroll/employees/:id/personal-info"];
    expect(findParentListingRoute("/payroll/employees/:id/personal-info", routes)).toBe("/payroll/employees");
  });
});

describe("resolveRoutes", () => {
  it("resolves known slugs to route path arrays", () => {
    const { resolved, warnings } = resolveRoutes(
      ["dashboard-page", "payroll-onboarding", "customers-page"],
      SAMPLE_APP
    );
    expect(resolved).toEqual({
      "dashboard-page": ["/dashboard"],
      "payroll-onboarding": ["/payroll/setup"],
      "customers-page": ["/customers"],
    });
    expect(warnings).toHaveLength(0);
  });

  it("warns and skips slugs with no matching import", () => {
    const { resolved, warnings } = resolveRoutes(
      ["nonexistent-page"],
      SAMPLE_APP
    );
    expect(resolved).toEqual({});
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("No import found");
    expect(warnings[0]).toContain("nonexistent-page");
  });

  it("warns and skips components with no route (wildcard-only)", () => {
    const { resolved, warnings } = resolveRoutes(
      ["not-found-page"],
      SAMPLE_APP
    );
    expect(resolved).toEqual({});
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("have no routes");
    expect(warnings[0]).toContain("NotFoundPage");
  });

  it("handles mix of resolvable and unresolvable slugs", () => {
    const { resolved, warnings } = resolveRoutes(
      ["dashboard-page", "unknown-page", "not-found-page"],
      SAMPLE_APP
    );
    expect(resolved).toEqual({ "dashboard-page": ["/dashboard"] });
    expect(warnings).toHaveLength(2);
  });

  it("returns empty resolved for empty slug array", () => {
    const { resolved, warnings } = resolveRoutes([], SAMPLE_APP);
    expect(resolved).toEqual({});
    expect(warnings).toHaveLength(0);
  });

  it("handles index-only component resolution", () => {
    const content = `
import HomePage from "./pages/HomePage";
<Route index element={<HomePage />} />
`;
    const { resolved } = resolveRoutes(["home-page"], content);
    expect(resolved).toEqual({ "home-page": ["/"] });
  });

  it("resolves multiple routes for a single slug", () => {
    const content = `
import EmployeeListPage from "./pages/employees/EmployeeListPage";
import EmployeeProfilePage from "./pages/employees/EmployeeProfilePage";
import EmployeeEditPage from "./pages/employees/EmployeeEditPage";

<Route path="employees" element={<EmployeeListPage />} />
<Route path="employees/:id" element={<EmployeeProfilePage />} />
<Route path="employees/:id/edit" element={<EmployeeEditPage />} />
`;
    const { resolved, warnings } = resolveRoutes(["employees"], content);
    expect(resolved).toEqual({
      employees: ["/employees", "/employees/:id", "/employees/:id/edit"],
    });
    expect(warnings).toHaveLength(0);
  });

  it("skips components without routes when slug has multiple components", () => {
    const content = `
import FooPage from "./pages/multi/FooPage";
import BarPage from "./pages/multi/BarPage";

<Route path="foo" element={<FooPage />} />
`;
    const { resolved, warnings } = resolveRoutes(["multi"], content);
    expect(resolved).toEqual({ multi: ["/foo"] });
    expect(warnings).toHaveLength(0);
  });
});

describe("resolveRoutes with filesBySlug", () => {
  it("filters to only routes for changed page components", () => {
    const filesBySlug = {
      "payroll-employees": ["src/pages/payroll/employees/sections/PersonalInfoPage.tsx"],
    };
    const { resolved } = resolveRoutes(["payroll-employees"], PAYROLL_APP, filesBySlug);
    expect(resolved["payroll-employees"]).toContain("/payroll/employees/:employeeId/personal-info");
    expect(resolved["payroll-employees"]).toContain("/payroll/employees");
    expect(resolved["payroll-employees"]).not.toContain("/payroll/employees/:employeeId");
    expect(resolved["payroll-employees"]).not.toContain("/payroll/employees/:employeeId/labor-type");
  });

  it("includes parent listing route for dynamic params", () => {
    const filesBySlug = {
      "payroll-employees": ["src/pages/payroll/employees/sections/LaborTypePage.tsx"],
    };
    const { resolved } = resolveRoutes(["payroll-employees"], PAYROLL_APP, filesBySlug);
    expect(resolved["payroll-employees"]).toContain("/payroll/employees/:employeeId/labor-type");
    expect(resolved["payroll-employees"]).toContain("/payroll/employees");
    expect(resolved["payroll-employees"]).toHaveLength(2);
  });

  it("falls back to all routes when changed file has no matching component", () => {
    const filesBySlug = {
      "payroll-onboarding": ["src/pages/payroll/onboarding/WizardHeader.tsx"],
    };
    const { resolved } = resolveRoutes(["payroll-onboarding"], PAYROLL_APP, filesBySlug);
    expect(resolved["payroll-onboarding"]).toEqual(["/payroll/setup"]);
  });

  it("falls back to all routes when no changed files produce routes", () => {
    const filesBySlug = {
      "payroll-employees": ["src/pages/payroll/employees/SomeHelper.tsx"],
    };
    const { resolved } = resolveRoutes(["payroll-employees"], PAYROLL_APP, filesBySlug);
    expect(resolved["payroll-employees"]).toHaveLength(4);
  });

  it("uses all routes when filesBySlug is null", () => {
    const { resolved } = resolveRoutes(["payroll-employees"], PAYROLL_APP, null);
    expect(resolved["payroll-employees"]).toHaveLength(4);
  });

  it("uses all routes when slug has no entry in filesBySlug", () => {
    const { resolved } = resolveRoutes(["payroll-employees"], PAYROLL_APP, {});
    expect(resolved["payroll-employees"]).toHaveLength(4);
  });

  it("handles multiple changed files in the same slug", () => {
    const filesBySlug = {
      "payroll-employees": [
        "src/pages/payroll/employees/sections/PersonalInfoPage.tsx",
        "src/pages/payroll/employees/sections/LaborTypePage.tsx",
      ],
    };
    const { resolved } = resolveRoutes(["payroll-employees"], PAYROLL_APP, filesBySlug);
    expect(resolved["payroll-employees"]).toContain("/payroll/employees/:employeeId/personal-info");
    expect(resolved["payroll-employees"]).toContain("/payroll/employees/:employeeId/labor-type");
    expect(resolved["payroll-employees"]).toContain("/payroll/employees");
    expect(resolved["payroll-employees"]).toHaveLength(3);
  });

  it("does not add parent listing route when changed route is static", () => {
    const filesBySlug = {
      payroll: ["src/pages/payroll/PayrollTaxSettingsPage.tsx"],
    };
    const { resolved } = resolveRoutes(["payroll"], PAYROLL_APP, filesBySlug);
    expect(resolved["payroll"]).toEqual(["/payroll/tax-settings"]);
  });

  it("handles mix of filtered and unfiltered slugs", () => {
    const filesBySlug = {
      "payroll-employees": ["src/pages/payroll/employees/sections/PersonalInfoPage.tsx"],
    };
    const { resolved } = resolveRoutes(
      ["payroll", "payroll-employees"],
      PAYROLL_APP,
      filesBySlug
    );
    expect(resolved["payroll"]).toHaveLength(2);
    expect(resolved["payroll-employees"]).toContain("/payroll/employees/:employeeId/personal-info");
    expect(resolved["payroll-employees"]).toContain("/payroll/employees");
  });
});
