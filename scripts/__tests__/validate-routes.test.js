import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { extractPageImports, extractImportedComponentNames, extractRoutes, extractRoutedComponents, getDiskPages } from "../validate-routes.js";

describe("extractPageImports", () => {
  it("extracts top-level page imports", () => {
    const content = `
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
`;
    const result = extractPageImports(content);
    expect(result).toEqual(new Set(["DashboardPage", "SettingsPage"]));
  });

  it("extracts directory-based page imports as directory name", () => {
    const content = `
import PayrollOnboardingPage from "./pages/payroll-onboarding/PayrollOnboardingPage";
`;
    const result = extractPageImports(content);
    expect(result).toEqual(new Set(["payroll-onboarding"]));
  });

  it("handles mixed single-file and directory imports", () => {
    const content = `
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import PayrollOnboardingPage from "./pages/payroll-onboarding/PayrollOnboardingPage";
`;
    const result = extractPageImports(content);
    expect(result).toEqual(new Set(["DashboardPage", "NotFoundPage", "payroll-onboarding"]));
  });

  it("returns empty set when no page imports exist", () => {
    const content = `
import React from "react";
import { Route } from "react-router-dom";
`;
    const result = extractPageImports(content);
    expect(result).toEqual(new Set());
  });

  it("handles single-quoted imports", () => {
    const content = `import DashboardPage from './pages/DashboardPage';`;
    const result = extractPageImports(content);
    expect(result).toEqual(new Set(["DashboardPage"]));
  });

  it("strips .tsx extension from imports", () => {
    const content = `import DashboardPage from "./pages/DashboardPage.tsx";`;
    const result = extractPageImports(content);
    expect(result).toEqual(new Set(["DashboardPage"]));
  });

  it("ignores non-pages imports", () => {
    const content = `
import AppShell from "./layouts/AppShell";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardPage from "./pages/DashboardPage";
`;
    const result = extractPageImports(content);
    expect(result).toEqual(new Set(["DashboardPage"]));
  });
});

describe("extractImportedComponentNames", () => {
  it("extracts component names from page imports", () => {
    const content = `
import DashboardPage from "./pages/DashboardPage";
import PayrollOnboardingPage from "./pages/payroll-onboarding/PayrollOnboardingPage";
`;
    const result = extractImportedComponentNames(content);
    expect(result).toEqual(new Set(["DashboardPage", "PayrollOnboardingPage"]));
  });

  it("ignores non-page imports", () => {
    const content = `
import AppShell from "./layouts/AppShell";
import DashboardPage from "./pages/DashboardPage";
`;
    const result = extractImportedComponentNames(content);
    expect(result).toEqual(new Set(["DashboardPage"]));
  });

  it("returns empty set when no page imports exist", () => {
    const content = `import React from "react";`;
    const result = extractImportedComponentNames(content);
    expect(result).toEqual(new Set());
  });
});

describe("extractRoutes", () => {
  it("extracts route paths", () => {
    const content = `
<Route path="dashboard" element={<DashboardPage />} />
<Route path="settings" element={<SettingsPage />} />
`;
    const result = extractRoutes(content);
    expect(result).toEqual([{ path: "dashboard" }, { path: "settings" }]);
  });

  it("extracts wildcard and absolute routes", () => {
    const content = `
<Route path="/dev/*" element={<DevRoutes />} />
<Route path="*" element={<NotFoundPage />} />
`;
    const result = extractRoutes(content);
    expect(result).toEqual([{ path: "/dev/*" }, { path: "*" }]);
  });

  it("handles single-quoted paths", () => {
    const content = `<Route path='dashboard' element={<DashboardPage />} />`;
    const result = extractRoutes(content);
    expect(result).toEqual([{ path: "dashboard" }]);
  });

  it("returns empty array when no routes exist", () => {
    const content = `<div>No routes here</div>`;
    const result = extractRoutes(content);
    expect(result).toEqual([]);
  });

  it("captures index routes", () => {
    const content = `
<Route index element={<DashboardPage />} />
<Route path="settings" element={<SettingsPage />} />
`;
    const result = extractRoutes(content);
    expect(result).toEqual([{ path: "settings" }, { path: "(index)" }]);
  });
});

describe("extractRoutedComponents", () => {
  it("extracts component names from Route elements", () => {
    const content = `
<Route path="dashboard" element={<DashboardPage />} />
<Route path="settings" element={<SettingsPage />} />
`;
    const result = extractRoutedComponents(content);
    expect(result).toEqual(new Set(["DashboardPage", "SettingsPage"]));
  });

  it("extracts components from index routes", () => {
    const content = `<Route index element={<DashboardPage />} />`;
    const result = extractRoutedComponents(content);
    expect(result).toEqual(new Set(["DashboardPage"]));
  });

  it("extracts components from wildcard routes", () => {
    const content = `<Route path="*" element={<NotFoundPage />} />`;
    const result = extractRoutedComponents(content);
    expect(result).toEqual(new Set(["NotFoundPage"]));
  });

  it("returns empty set when no routes exist", () => {
    const content = `<div>No routes</div>`;
    const result = extractRoutedComponents(content);
    expect(result).toEqual(new Set());
  });

  it("handles layout routes without element", () => {
    const content = `
<Route element={<AppShell />}>
  <Route path="dashboard" element={<DashboardPage />} />
</Route>
`;
    const result = extractRoutedComponents(content);
    expect(result).toEqual(new Set(["AppShell", "DashboardPage"]));
  });

  it("deduplicates components used in multiple routes", () => {
    const content = `
<Route index element={<DashboardPage />} />
<Route path="dashboard" element={<DashboardPage />} />
`;
    const result = extractRoutedComponents(content);
    expect(result).toEqual(new Set(["DashboardPage"]));
  });
});

describe("getDiskPages", () => {
  it("returns empty array for non-existent directory", () => {
    const result = getDiskPages("/non/existent/path");
    expect(result).toEqual([]);
  });

  it("detects .tsx files as file type", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "validate-routes-test-"));
    try {
      fs.writeFileSync(path.join(tmpDir, "DashboardPage.tsx"), "export default function DashboardPage() {}");
      fs.writeFileSync(path.join(tmpDir, "SettingsPage.tsx"), "export default function SettingsPage() {}");

      const result = getDiskPages(tmpDir);
      const names = result.map((p) => p.name).sort();
      expect(names).toEqual(["DashboardPage", "SettingsPage"]);
      expect(result.every((p) => p.type === "file")).toBe(true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  it("detects directories as directory type", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "validate-routes-test-"));
    try {
      fs.mkdirSync(path.join(tmpDir, "payroll-onboarding"));

      const result = getDiskPages(tmpDir);
      expect(result).toEqual([
        {
          type: "directory",
          name: "payroll-onboarding",
          path: path.join(tmpDir, "payroll-onboarding"),
        },
      ]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  it("handles mixed files and directories", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "validate-routes-test-"));
    try {
      fs.writeFileSync(path.join(tmpDir, "DashboardPage.tsx"), "");
      fs.mkdirSync(path.join(tmpDir, "payroll-onboarding"));

      const result = getDiskPages(tmpDir);
      expect(result).toHaveLength(2);

      const file = result.find((p) => p.type === "file");
      const dir = result.find((p) => p.type === "directory");
      expect(file.name).toBe("DashboardPage");
      expect(dir.name).toBe("payroll-onboarding");
    } finally {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  it("ignores non-.tsx files", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "validate-routes-test-"));
    try {
      fs.writeFileSync(path.join(tmpDir, "DashboardPage.tsx"), "");
      fs.writeFileSync(path.join(tmpDir, "utils.ts"), "");
      fs.writeFileSync(path.join(tmpDir, "README.md"), "");

      const result = getDiskPages(tmpDir);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("DashboardPage");
    } finally {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });
});
