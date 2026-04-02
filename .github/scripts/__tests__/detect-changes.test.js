import { describe, it, expect, afterAll } from "vitest";
import { writeFileSync, rmSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  pascalToKebab,
  fileToSlug,
  buildFilesBySlug,
  slugMatchesPattern,
  filterExcluded,
  loadExcludePatterns,
  PAGES_DIR,
} from "../detect-changes.js";

describe("pascalToKebab", () => {
  it("converts simple PascalCase", () => {
    expect(pascalToKebab("DashboardPage")).toBe("dashboard-page");
  });

  it("converts multi-word PascalCase", () => {
    expect(pascalToKebab("PayrollOnboardingPage")).toBe(
      "payroll-onboarding-page"
    );
  });

  it("handles consecutive uppercase letters", () => {
    expect(pascalToKebab("ADOIntegration")).toBe("ado-integration");
  });

  it("handles single word", () => {
    expect(pascalToKebab("Settings")).toBe("settings");
  });

  it("preserves already-lowercase strings", () => {
    expect(pascalToKebab("dashboard")).toBe("dashboard");
  });

  it("handles mixed case with numbers", () => {
    expect(pascalToKebab("Step2Review")).toBe("step2-review");
  });
});

describe("fileToSlug", () => {
  it("maps top-level .tsx file to kebab-case slug", () => {
    expect(fileToSlug(`${PAGES_DIR}DashboardPage.tsx`)).toBe("dashboard-page");
  });

  it("maps top-level .ts file to kebab-case slug", () => {
    expect(fileToSlug(`${PAGES_DIR}SettingsPage.ts`)).toBe("settings-page");
  });

  it("maps nested file to depth-2 slug", () => {
    expect(
      fileToSlug(
        `${PAGES_DIR}payroll/onboarding/steps/TaxSetupStep.tsx`
      )
    ).toBe("payroll-onboarding");
  });

  it("maps deeply nested file to depth-2 slug", () => {
    expect(
      fileToSlug(
        `${PAGES_DIR}payroll/employees/sections/PersonalInfoPage.tsx`
      )
    ).toBe("payroll-employees");
  });

  it("maps nested page entry file to depth-2 slug", () => {
    expect(
      fileToSlug(
        `${PAGES_DIR}payroll/onboarding/PayrollOnboardingPage.tsx`
      )
    ).toBe("payroll-onboarding");
  });

  it("returns null for non-ts/tsx files", () => {
    expect(fileToSlug(`${PAGES_DIR}README.md`)).toBeNull();
  });

  it("returns null for css files", () => {
    expect(fileToSlug(`${PAGES_DIR}styles.css`)).toBeNull();
  });

  it("returns null for json files", () => {
    expect(fileToSlug(`${PAGES_DIR}data.json`)).toBeNull();
  });

  it("handles .tsx extension correctly", () => {
    expect(fileToSlug(`${PAGES_DIR}NotFoundPage.tsx`)).toBe("not-found-page");
  });

  it("deduplicates nested files to the same slug", () => {
    const files = [
      `${PAGES_DIR}payroll/onboarding/PayrollOnboardingPage.tsx`,
      `${PAGES_DIR}payroll/onboarding/steps/WelcomeStep.tsx`,
      `${PAGES_DIR}payroll/onboarding/steps/ReviewStep.tsx`,
      `${PAGES_DIR}payroll/onboarding/WizardHeader.tsx`,
    ];
    const slugs = new Set(files.map(fileToSlug));
    expect(slugs).toEqual(new Set(["payroll-onboarding"]));
  });

  it("maps file in depth-1 directory to single-segment slug", () => {
    expect(fileToSlug(`${PAGES_DIR}payroll/PayrollHomePage.tsx`)).toBe(
      "payroll"
    );
  });

  it("maps file in depth-2 directory to two-segment slug", () => {
    expect(
      fileToSlug(`${PAGES_DIR}payroll/employees/PayrollEmployeesPage.tsx`)
    ).toBe("payroll-employees");
  });

  it("maps file in depth-3+ directory to depth-2 slug", () => {
    expect(
      fileToSlug(`${PAGES_DIR}payroll/employees/sections/TimecardPage.tsx`)
    ).toBe("payroll-employees");
  });
});

describe("buildFilesBySlug", () => {
  it("groups files by their slug", () => {
    const files = [
      `${PAGES_DIR}payroll/employees/PayrollEmployeesPage.tsx`,
      `${PAGES_DIR}payroll/employees/sections/PersonalInfoPage.tsx`,
      `${PAGES_DIR}DashboardPage.tsx`,
    ];
    const result = buildFilesBySlug(files);
    expect(result).toEqual({
      "payroll-employees": [
        `${PAGES_DIR}payroll/employees/PayrollEmployeesPage.tsx`,
        `${PAGES_DIR}payroll/employees/sections/PersonalInfoPage.tsx`,
      ],
      "dashboard-page": [`${PAGES_DIR}DashboardPage.tsx`],
    });
  });

  it("sorts files within each slug", () => {
    const files = [
      `${PAGES_DIR}payroll/onboarding/steps/ReviewStep.tsx`,
      `${PAGES_DIR}payroll/onboarding/PayrollOnboardingPage.tsx`,
      `${PAGES_DIR}payroll/onboarding/steps/WelcomeStep.tsx`,
    ];
    const result = buildFilesBySlug(files);
    const onboardingFiles = result["payroll-onboarding"];
    expect(onboardingFiles).toEqual([...onboardingFiles].sort());
  });

  it("skips non-ts/tsx files", () => {
    const files = [
      `${PAGES_DIR}README.md`,
      `${PAGES_DIR}DashboardPage.tsx`,
      `${PAGES_DIR}styles.css`,
    ];
    const result = buildFilesBySlug(files);
    expect(Object.keys(result)).toEqual(["dashboard-page"]);
  });

  it("returns empty object for empty input", () => {
    expect(buildFilesBySlug([])).toEqual({});
  });

  it("handles single file", () => {
    const result = buildFilesBySlug([`${PAGES_DIR}payroll/PayrollHomePage.tsx`]);
    expect(result).toEqual({
      payroll: [`${PAGES_DIR}payroll/PayrollHomePage.tsx`],
    });
  });
});

describe("slugMatchesPattern", () => {
  it("matches exact slug", () => {
    expect(slugMatchesPattern("dashboard-page", "dashboard-page")).toBe(true);
  });

  it("rejects non-matching exact slug", () => {
    expect(slugMatchesPattern("dashboard-page", "settings-page")).toBe(false);
  });

  it("matches wildcard prefix", () => {
    expect(slugMatchesPattern("payroll-onboarding", "payroll-*")).toBe(true);
  });

  it("rejects non-matching wildcard prefix", () => {
    expect(slugMatchesPattern("dashboard-page", "payroll-*")).toBe(false);
  });

  it("matches wildcard suffix", () => {
    expect(slugMatchesPattern("dashboard-page", "*-page")).toBe(true);
  });

  it("matches wildcard in the middle", () => {
    expect(slugMatchesPattern("payroll-onboarding-wizard", "payroll-*-wizard")).toBe(true);
  });

  it("matches bare wildcard (everything)", () => {
    expect(slugMatchesPattern("anything", "*")).toBe(true);
  });

  it("treats dots in pattern as literal characters", () => {
    expect(slugMatchesPattern("fooXbar", "foo.bar")).toBe(false);
    expect(slugMatchesPattern("foo.bar", "foo.bar")).toBe(true);
  });

  it("escapes regex metacharacters in wildcard patterns", () => {
    expect(slugMatchesPattern("v1Xstuff", "v1.*")).toBe(false);
    expect(slugMatchesPattern("v1.stuff", "v1.*")).toBe(true);
  });

  it("returns false for empty slug with a non-empty pattern", () => {
    expect(slugMatchesPattern("", "dashboard-page")).toBe(false);
  });

  it("returns false for non-empty slug with empty pattern", () => {
    expect(slugMatchesPattern("dashboard-page", "")).toBe(false);
  });
});

describe("filterExcluded", () => {
  it("returns all slugs when no patterns", () => {
    const slugs = ["alpha", "beta", "gamma"];
    expect(filterExcluded(slugs, [])).toEqual(["alpha", "beta", "gamma"]);
  });

  it("filters exact matches", () => {
    const slugs = ["alpha", "beta", "gamma"];
    expect(filterExcluded(slugs, ["beta"])).toEqual(["alpha", "gamma"]);
  });

  it("filters wildcard matches", () => {
    const slugs = ["payroll-onboarding", "payroll-setup", "dashboard-page"];
    expect(filterExcluded(slugs, ["payroll-*"])).toEqual(["dashboard-page"]);
  });

  it("filters multiple patterns", () => {
    const slugs = ["payroll-onboarding", "settings-page", "dashboard-page"];
    expect(filterExcluded(slugs, ["payroll-*", "*-page"])).toEqual([]);
  });

  it("does not modify input array", () => {
    const slugs = ["alpha", "beta"];
    filterExcluded(slugs, ["alpha"]);
    expect(slugs).toEqual(["alpha", "beta"]);
  });

  it("returns a new array even when patterns are empty", () => {
    const slugs = ["alpha", "beta"];
    const result = filterExcluded(slugs, []);
    expect(result).toEqual(slugs);
    expect(result).not.toBe(slugs);
  });
});

describe("loadExcludePatterns", () => {
  const dirs = [];

  function tmpFile(name, content) {
    const dir = mkdtempSync(join(tmpdir(), "bd-test-"));
    dirs.push(dir);
    const filePath = join(dir, name);
    writeFileSync(filePath, content);
    return filePath;
  }

  afterAll(() => {
    for (const dir of dirs) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns empty array for missing config file", () => {
    expect(loadExcludePatterns("/nonexistent/path.json")).toEqual([]);
  });

  it("returns empty array for malformed JSON", () => {
    expect(loadExcludePatterns(tmpFile("bad.json", "not-json"))).toEqual([]);
  });

  it("returns empty array when exclude is not an array", () => {
    const f = tmpFile("obj.json", JSON.stringify({ exclude: "not-array" }));
    expect(loadExcludePatterns(f)).toEqual([]);
  });

  it("filters out non-string entries in exclude array", () => {
    const f = tmpFile("mixed.json", JSON.stringify({ exclude: [42, null, "valid-*", true] }));
    expect(loadExcludePatterns(f)).toEqual(["valid-*"]);
  });

  it("filters out empty string entries in exclude array", () => {
    const f = tmpFile("empty-str.json", JSON.stringify({ exclude: ["", "valid", ""] }));
    expect(loadExcludePatterns(f)).toEqual(["valid"]);
  });

  it("loads valid exclude patterns", () => {
    const f = tmpFile("good.json", JSON.stringify({ exclude: ["foo", "bar-*"] }));
    expect(loadExcludePatterns(f)).toEqual(["foo", "bar-*"]);
  });
});
