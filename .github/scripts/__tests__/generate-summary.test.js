import { describe, it, expect } from "vitest";
import {
  parseAction,
  formatAdoLink,
  generateSummary,
} from "../generate-summary.js";

describe("parseAction", () => {
  it('parses "created" as Created v1', () => {
    expect(parseAction("created")).toEqual({
      status: "Created",
      version: "v1",
    });
  });

  it('parses "created-v2" as Created v2', () => {
    expect(parseAction("created-v2")).toEqual({
      status: "Created",
      version: "v2",
    });
  });

  it('parses "created-v10" as Created v10', () => {
    expect(parseAction("created-v10")).toEqual({
      status: "Created",
      version: "v10",
    });
  });

  it('parses "skipped" as Skipped (duplicate)', () => {
    expect(parseAction("skipped")).toEqual({
      status: "Skipped (duplicate)",
      version: null,
    });
  });

  it("returns Unknown for null", () => {
    expect(parseAction(null)).toEqual({ status: "Unknown", version: null });
  });

  it("returns Unknown for undefined", () => {
    expect(parseAction(undefined)).toEqual({
      status: "Unknown",
      version: null,
    });
  });

  it("returns Unknown for empty string", () => {
    expect(parseAction("")).toEqual({ status: "Unknown", version: null });
  });

  it("returns raw action for unrecognized strings", () => {
    expect(parseAction("some-other-action")).toEqual({
      status: "some-other-action",
      version: null,
    });
  });

  it("returns Unknown for non-string input", () => {
    expect(parseAction(42)).toEqual({ status: "Unknown", version: null });
  });
});

describe("formatAdoLink", () => {
  it("returns markdown link when id and url are present", () => {
    const result = formatAdoLink({
      id: 12345,
      url: "https://dev.azure.com/org/proj/_workitems/edit/12345",
    });
    expect(result).toBe(
      "[#12345](https://dev.azure.com/org/proj/_workitems/edit/12345)"
    );
  });

  it("returns plain id when url is missing", () => {
    expect(formatAdoLink({ id: 999 })).toBe("#999");
  });

  it('returns "-" for null', () => {
    expect(formatAdoLink(null)).toBe("-");
  });

  it('returns "-" for undefined', () => {
    expect(formatAdoLink(undefined)).toBe("-");
  });

  it('returns "-" when id is missing', () => {
    expect(formatAdoLink({ url: "https://example.com" })).toBe("-");
  });

  it("handles id of 0 (falsy but valid number)", () => {
    expect(formatAdoLink({ id: 0 })).toBe("-");
  });
});

describe("generateSummary", () => {
  it("reports no changes when all inputs are empty", () => {
    const md = generateSummary([], [], []);
    expect(md).toContain("**Prototypes detected:** 0");
    expect(md).toContain("No prototype changes detected");
  });

  it("reports correct counts for created work items", () => {
    const slugs = ["dashboard", "settings"];
    const workitems = [
      {
        id: 100,
        url: "https://dev.azure.com/org/proj/_workitems/edit/100",
        slug: "dashboard",
        action: "created",
      },
      {
        id: 101,
        url: "https://dev.azure.com/org/proj/_workitems/edit/101",
        slug: "settings",
        action: "created-v2",
      },
    ];
    const md = generateSummary(slugs, workitems, []);
    expect(md).toContain("**Prototypes detected:** 2");
    expect(md).toContain("**Created:** 2");
    expect(md).toContain("**Skipped:** 0");
    expect(md).toContain("**Errors:** 0");
    expect(md).toContain("| dashboard | Created | v1 |");
    expect(md).toContain("| settings | Created | v2 |");
    expect(md).toContain("[#100]");
    expect(md).toContain("[#101]");
  });

  it("reports skipped duplicates", () => {
    const slugs = ["dashboard"];
    const workitems = [
      {
        id: 100,
        url: "https://dev.azure.com/org/proj/_workitems/edit/100",
        slug: "dashboard",
        action: "skipped",
      },
    ];
    const md = generateSummary(slugs, workitems, []);
    expect(md).toContain("**Created:** 0");
    expect(md).toContain("**Skipped:** 1");
    expect(md).toContain("| dashboard | Skipped (duplicate) | - |");
  });

  it("reports errors with details", () => {
    const slugs = ["wizard"];
    const errors = [{ slug: "wizard", error: "ADO API 401: Unauthorized" }];
    const md = generateSummary(slugs, [], errors);
    expect(md).toContain("**Errors:** 1");
    expect(md).toContain("| wizard | Error | - | - |");
    expect(md).toContain("### Errors");
    expect(md).toContain("- **wizard**: ADO API 401: Unauthorized");
  });

  it("handles mix of created, skipped, and errors", () => {
    const slugs = ["dashboard", "settings", "wizard"];
    const workitems = [
      {
        id: 100,
        url: "https://dev.azure.com/org/proj/_workitems/edit/100",
        slug: "dashboard",
        action: "created",
      },
      {
        id: 99,
        url: "https://dev.azure.com/org/proj/_workitems/edit/99",
        slug: "settings",
        action: "skipped",
      },
    ];
    const errors = [{ slug: "wizard", error: "Network timeout" }];
    const md = generateSummary(slugs, workitems, errors);
    expect(md).toContain("**Prototypes detected:** 3");
    expect(md).toContain("**Created:** 1");
    expect(md).toContain("**Skipped:** 1");
    expect(md).toContain("**Errors:** 1");
    expect(md).toContain("| dashboard | Created | v1 |");
    expect(md).toContain("| settings | Skipped (duplicate) |");
    expect(md).toContain("| wizard | Error | - | - |");
    expect(md).toContain("- **wizard**: Network timeout");
  });

  it("handles slug detected but not processed (no workitem, no error)", () => {
    const slugs = ["orphan"];
    const md = generateSummary(slugs, [], []);
    expect(md).toContain("| orphan | Not processed | - | - |");
  });

  it("handles workitems for slugs not in the slugs array", () => {
    const workitems = [
      { id: 200, url: "https://example.com", slug: "extra", action: "created" },
    ];
    const md = generateSummary([], workitems, []);
    expect(md).toContain("| extra | Created | v1 |");
  });

  it("does not include Errors section when there are no errors", () => {
    const slugs = ["dashboard"];
    const workitems = [
      { id: 100, url: "https://example.com", slug: "dashboard", action: "created" },
    ];
    const md = generateSummary(slugs, workitems, []);
    expect(md).not.toContain("### Errors");
  });

  it("handles null/undefined inputs gracefully", () => {
    const md = generateSummary(null, null, null);
    expect(md).toContain("**Prototypes detected:** 0");
    expect(md).toContain("No prototype changes detected");
  });

  it("includes table headers", () => {
    const slugs = ["test"];
    const workitems = [
      { id: 1, url: "https://example.com", slug: "test", action: "created" },
    ];
    const md = generateSummary(slugs, workitems, []);
    expect(md).toContain("| Prototype | Status | Version | ADO Link |");
    expect(md).toContain("|-----------|--------|---------|----------|");
  });

  it("handles multiple errors for different slugs", () => {
    const slugs = ["a", "b", "c"];
    const errors = [
      { slug: "a", error: "Error A" },
      { slug: "b", error: "Error B" },
      { slug: "c", error: "Error C" },
    ];
    const md = generateSummary(slugs, [], errors);
    expect(md).toContain("**Errors:** 3");
    expect(md).toContain("- **a**: Error A");
    expect(md).toContain("- **b**: Error B");
    expect(md).toContain("- **c**: Error C");
  });

  it("includes summary heading", () => {
    const md = generateSummary([], [], []);
    expect(md).toContain("## Prototype Ingestion Summary");
  });

  it("handles versioned actions in the table", () => {
    const slugs = ["page"];
    const workitems = [
      { id: 42, url: "https://example.com", slug: "page", action: "created-v5" },
    ];
    const md = generateSummary(slugs, workitems, []);
    expect(md).toContain("| page | Created | v5 |");
  });

  it("workitem takes priority when slug appears in both workitems and errors", () => {
    const slugs = ["dashboard"];
    const workitems = [
      { id: 100, url: "https://example.com", slug: "dashboard", action: "created" },
    ];
    const errors = [{ slug: "dashboard", error: "Partial failure" }];
    const md = generateSummary(slugs, workitems, errors);
    expect(md).toContain("| dashboard | Created | v1 |");
    expect(md).not.toContain("| dashboard | Error |");
    expect(md).toContain("### Errors");
    expect(md).toContain("- **dashboard**: Partial failure");
  });
});
