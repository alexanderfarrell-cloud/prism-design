import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import {
  kebabToPascal,
  findSourceFiles,
  resolveSlugToDir,
  buildMetadataPrompt,
  generatePrompts,
  loadPromptTemplate,
} from "../extract-metadata.js";

describe("loadPromptTemplate", () => {
  it("loads the template and strips YAML frontmatter", () => {
    const template = loadPromptTemplate();
    expect(template).not.toMatch(/^---/);
    expect(template).toContain("{{NAME}}");
    expect(template).toContain("{{SLUG}}");
    expect(template).toContain("{{SOURCE_FILES}}");
  });
});

describe("kebabToPascal", () => {
  it("converts simple kebab-case", () => {
    expect(kebabToPascal("dashboard")).toBe("Dashboard");
  });

  it("converts multi-word kebab-case", () => {
    expect(kebabToPascal("dashboard-page")).toBe("DashboardPage");
  });

  it("converts single word", () => {
    expect(kebabToPascal("settings")).toBe("Settings");
  });

  it("handles complex slug", () => {
    expect(kebabToPascal("payroll-onboarding")).toBe("PayrollOnboarding");
  });

  it("returns empty string for empty input", () => {
    expect(kebabToPascal("")).toBe("");
  });

  it("returns empty string for non-string", () => {
    expect(kebabToPascal(null)).toBe("");
    expect(kebabToPascal(undefined)).toBe("");
  });
});

describe("resolveSlugToDir", () => {
  it("resolves direct directory match", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(path.join(pagesDir, "payroll"), { recursive: true });
      const result = resolveSlugToDir("payroll", pagesDir);
      expect(result).toBe(path.join(pagesDir, "payroll"));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("resolves nested directory by splitting slug at dash", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(path.join(pagesDir, "payroll", "employees"), {
        recursive: true,
      });
      const result = resolveSlugToDir("payroll-employees", pagesDir);
      expect(result).toBe(path.join(pagesDir, "payroll", "employees"));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("returns null when no directory matches", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(pagesDir, { recursive: true });
      const result = resolveSlugToDir("nonexistent", pagesDir);
      expect(result).toBeNull();
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("prefers direct match over nested split", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(path.join(pagesDir, "payroll-employees"), {
        recursive: true,
      });
      fs.mkdirSync(path.join(pagesDir, "payroll", "employees"), {
        recursive: true,
      });
      const result = resolveSlugToDir("payroll-employees", pagesDir);
      expect(result).toBe(path.join(pagesDir, "payroll-employees"));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("findSourceFiles", () => {
  it("finds top-level .tsx file for top-level slug", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.writeFileSync(path.join(pagesDir, "DashboardPage.tsx"), "// test");
      const result = findSourceFiles("dashboard-page", pagesDir);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain("DashboardPage.tsx");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("finds top-level .ts file when .tsx does not exist", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.writeFileSync(path.join(pagesDir, "SettingsPage.ts"), "// test");
      const result = findSourceFiles("settings-page", pagesDir);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain("SettingsPage.ts");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("depth-1 directory slug includes only top-level files (subdirs are separate slugs)", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      const subdir = path.join(pagesDir, "payroll-onboarding");
      const stepsDir = path.join(subdir, "steps");
      fs.mkdirSync(stepsDir, { recursive: true });
      fs.writeFileSync(
        path.join(subdir, "PayrollOnboardingPage.tsx"),
        "// test"
      );
      fs.writeFileSync(path.join(subdir, "WizardHeader.tsx"), "// test");
      fs.writeFileSync(path.join(stepsDir, "WelcomeStep.tsx"), "// test");
      fs.writeFileSync(path.join(stepsDir, "types.ts"), "// test");
      const result = findSourceFiles("payroll-onboarding", pagesDir);
      const normalized = (p) => p.replace(/\\/g, "/");
      expect(result).toHaveLength(2);
      expect(result.map(normalized)).toContain(
        normalized(
          path.join(pagesDir, "payroll-onboarding", "PayrollOnboardingPage.tsx")
        )
      );
      expect(result.map(normalized)).toContain(
        normalized(
          path.join(pagesDir, "payroll-onboarding", "WizardHeader.tsx")
        )
      );
      expect(result.every((f) => !f.includes("steps"))).toBe(true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("returns empty array for non-existent slug", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(pagesDir, { recursive: true });
      const result = findSourceFiles("non-existent-page", pagesDir);
      expect(result).toEqual([]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("returns empty array when pagesDir does not exist", () => {
    const result = findSourceFiles("dashboard-page", "/nonexistent/path/xyz");
    expect(result).toEqual([]);
  });

  it("finds files in nested directory via slug splitting", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      const nestedDir = path.join(pagesDir, "payroll", "employees");
      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(
        path.join(nestedDir, "PayrollEmployeesPage.tsx"),
        "// test"
      );
      const result = findSourceFiles("payroll-employees", pagesDir);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain("PayrollEmployeesPage.tsx");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("uses default pagesDir when omitted and finds real dashboard-page", () => {
    const result = findSourceFiles("dashboard-page");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatch(/DashboardPage\.tsx$/);
  });

  it("depth-1 slug does not recurse into subdirectories", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      const payrollDir = path.join(pagesDir, "payroll");
      const employeesDir = path.join(payrollDir, "employees");
      const onboardingDir = path.join(payrollDir, "onboarding", "steps");
      fs.mkdirSync(employeesDir, { recursive: true });
      fs.mkdirSync(onboardingDir, { recursive: true });
      fs.writeFileSync(path.join(payrollDir, "PayrollHomePage.tsx"), "// test");
      fs.writeFileSync(path.join(payrollDir, "PayrollTaxSettingsPage.tsx"), "// test");
      fs.writeFileSync(path.join(employeesDir, "PayrollEmployeesPage.tsx"), "// test");
      fs.writeFileSync(path.join(onboardingDir, "WelcomeStep.tsx"), "// test");
      const result = findSourceFiles("payroll", pagesDir);
      expect(result).toHaveLength(2);
      expect(result.every((f) => !f.includes("employees"))).toBe(true);
      expect(result.every((f) => !f.includes("onboarding"))).toBe(true);
      expect(result.some((f) => f.includes("PayrollHomePage.tsx"))).toBe(true);
      expect(result.some((f) => f.includes("PayrollTaxSettingsPage.tsx"))).toBe(true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("depth-2 slug recurses fully into subdirectories", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      const employeesDir = path.join(pagesDir, "payroll", "employees");
      const sectionsDir = path.join(employeesDir, "sections");
      fs.mkdirSync(sectionsDir, { recursive: true });
      fs.writeFileSync(path.join(employeesDir, "PayrollEmployeesPage.tsx"), "// test");
      fs.writeFileSync(path.join(sectionsDir, "PersonalInfoPage.tsx"), "// test");
      fs.writeFileSync(path.join(sectionsDir, "LaborTypePage.tsx"), "// test");
      const result = findSourceFiles("payroll-employees", pagesDir);
      expect(result).toHaveLength(3);
      expect(result.some((f) => f.includes("PayrollEmployeesPage.tsx"))).toBe(true);
      expect(result.some((f) => f.includes("PersonalInfoPage.tsx"))).toBe(true);
      expect(result.some((f) => f.includes("LaborTypePage.tsx"))).toBe(true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("depth-2 slug with steps recurses fully", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      const onboardingDir = path.join(pagesDir, "payroll", "onboarding");
      const stepsDir = path.join(onboardingDir, "steps");
      fs.mkdirSync(stepsDir, { recursive: true });
      fs.writeFileSync(path.join(onboardingDir, "PayrollOnboardingPage.tsx"), "// test");
      fs.writeFileSync(path.join(onboardingDir, "WizardHeader.tsx"), "// test");
      fs.writeFileSync(path.join(stepsDir, "WelcomeStep.tsx"), "// test");
      fs.writeFileSync(path.join(stepsDir, "TaxSetupStep.tsx"), "// test");
      const result = findSourceFiles("payroll-onboarding", pagesDir);
      expect(result).toHaveLength(4);
      expect(result.some((f) => f.includes("steps/WelcomeStep.tsx"))).toBe(true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("buildMetadataPrompt", () => {
  it("includes slug in prompt", () => {
    const prompt = buildMetadataPrompt("dashboard-page", [
      "src/pages/DashboardPage.tsx",
    ]);
    expect(prompt).toContain("dashboard-page");
  });

  it("includes source files in prompt", () => {
    const sourceFiles = ["src/pages/DashboardPage.tsx"];
    const prompt = buildMetadataPrompt("dashboard-page", sourceFiles);
    expect(prompt).toContain("src/pages/DashboardPage.tsx");
    expect(prompt).toContain("- src/pages/DashboardPage.tsx");
  });

  it("includes expected output schema", () => {
    const prompt = buildMetadataPrompt("dashboard-page", [
      "src/pages/DashboardPage.tsx",
    ]);
    expect(prompt).toContain('"name"');
    expect(prompt).toContain('"slug"');
    expect(prompt).toContain('"components"');
    expect(prompt).toContain('"interactiveElements"');
    expect(prompt).toContain('"props"');
    expect(prompt).toContain('"children"');
    expect(prompt).toContain('"type"');
    expect(prompt).toContain('"label"');
    expect(prompt).toContain('"position"');
  });

  it("strips Page suffix from name in schema", () => {
    const prompt = buildMetadataPrompt("dashboard-page", []);
    expect(prompt).toContain('"name": "Dashboard"');
  });

  it("replaces SOURCE_FILES with empty content when sourceFiles is empty", () => {
    const prompt = buildMetadataPrompt("dashboard-page", []);
    expect(prompt).not.toContain("{{SOURCE_FILES}}");
  });

  it("handles multiple source files", () => {
    const sourceFiles = [
      "src/pages/payroll-onboarding/PayrollOnboardingPage.tsx",
      "src/pages/payroll-onboarding/steps/WelcomeStep.tsx",
    ];
    const prompt = buildMetadataPrompt("payroll-onboarding", sourceFiles);
    expect(prompt).toContain(sourceFiles[0]);
    expect(prompt).toContain(sourceFiles[1]);
  });
});

describe("generatePrompts", () => {
  it("returns empty array for empty input", () => {
    expect(generatePrompts([])).toEqual([]);
  });

  it("returns empty array for non-array input", () => {
    expect(generatePrompts(null)).toEqual([]);
    expect(generatePrompts(undefined)).toEqual([]);
  });

  it("filters out non-string entries in the slugs array", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.writeFileSync(path.join(pagesDir, "DashboardPage.tsx"), "// test");
      const result = generatePrompts(
        [123, null, undefined, "dashboard-page", true],
        pagesDir
      );
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("dashboard-page");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("trims whitespace from slugs", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.writeFileSync(path.join(pagesDir, "DashboardPage.tsx"), "// test");
      const result = generatePrompts(["  dashboard-page  "], pagesDir);
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("dashboard-page");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("filters out slugs with no source files", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.writeFileSync(path.join(pagesDir, "DashboardPage.tsx"), "// test");
      const result = generatePrompts(
        ["dashboard-page", "non-existent"],
        pagesDir
      );
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe("dashboard-page");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("produces one prompt per slug with source files", () => {
    const result = generatePrompts(["dashboard-page", "payroll-onboarding"]);
    expect(result.length).toBeGreaterThanOrEqual(1);
    for (const item of result) {
      expect(item).toHaveProperty("slug");
      expect(item).toHaveProperty("sourceFiles");
      expect(item).toHaveProperty("prompt");
      expect(Array.isArray(item.sourceFiles)).toBe(true);
      expect(typeof item.prompt).toBe("string");
    }
  });
});

describe("generatePrompts with filesBySlug", () => {
  it("uses filesBySlug files instead of directory scan", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      const dir = path.join(pagesDir, "payroll", "employees", "sections");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "PersonalInfoPage.tsx"), "// test");
      fs.writeFileSync(path.join(dir, "LaborTypePage.tsx"), "// test");

      const filesBySlug = {
        "payroll-employees": [
          path.join(pagesDir, "payroll", "employees", "sections", "PersonalInfoPage.tsx"),
        ],
      };
      const result = generatePrompts(["payroll-employees"], pagesDir, filesBySlug);
      expect(result).toHaveLength(1);
      expect(result[0].sourceFiles).toHaveLength(1);
      expect(result[0].sourceFiles[0]).toContain("PersonalInfoPage.tsx");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("falls back to directory scan when filesBySlug has no entry for slug", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.writeFileSync(path.join(pagesDir, "DashboardPage.tsx"), "// test");
      const result = generatePrompts(["dashboard-page"], pagesDir, {});
      expect(result).toHaveLength(1);
      expect(result[0].sourceFiles).toHaveLength(1);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("falls back to directory scan when filesBySlug is null", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.writeFileSync(path.join(pagesDir, "DashboardPage.tsx"), "// test");
      const result = generatePrompts(["dashboard-page"], pagesDir, null);
      expect(result).toHaveLength(1);
      expect(result[0].sourceFiles).toHaveLength(1);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("filters out non-existent file paths from filesBySlug", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      const dir = path.join(pagesDir, "payroll", "employees");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "PayrollEmployeesPage.tsx"), "// test");

      const filesBySlug = {
        "payroll-employees": [
          path.join(dir, "PayrollEmployeesPage.tsx"),
          path.join(dir, "DeletedPage.tsx"),
        ],
      };
      const result = generatePrompts(["payroll-employees"], pagesDir, filesBySlug);
      expect(result).toHaveLength(1);
      expect(result[0].sourceFiles).toHaveLength(1);
      expect(result[0].sourceFiles[0]).toContain("PayrollEmployeesPage.tsx");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("falls back to directory scan when all filesBySlug paths are non-existent", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "extract-metadata-"));
    try {
      const pagesDir = path.join(tmp, "pages");
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.writeFileSync(path.join(pagesDir, "DashboardPage.tsx"), "// test");

      const filesBySlug = {
        "dashboard-page": [
          path.join(pagesDir, "DeletedPage.tsx"),
          path.join(pagesDir, "RenamedPage.tsx"),
        ],
      };
      const result = generatePrompts(["dashboard-page"], pagesDir, filesBySlug);
      expect(result).toHaveLength(1);
      expect(result[0].sourceFiles).toHaveLength(1);
      expect(result[0].sourceFiles[0]).toContain("DashboardPage.tsx");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
