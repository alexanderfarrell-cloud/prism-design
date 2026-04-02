import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import {
  buildAuthHeader,
  buildWorkItemPayload,
  buildWorkItemUrl,
  buildWiqlQuery,
  buildTitle,
  formatDescription,
  renderComponentTree,
  formatInteractiveElement,
  escapeWiql,
  uploadScreenshots,
  linkAttachments,
  processPrototype,
  runWiqlQuery,
  checkIdempotency,
  detectVersion,
  addRelatedLink,
  fetchBoardConfig,
  updateBoardPosition,
  extractPageNames,
} from "../create-ado-workitems.js";

describe("buildAuthHeader", () => {
  it("returns correct base64 encoding of :PAT format", () => {
    const pat = "my-secret-token";
    const header = buildAuthHeader(pat);
    expect(header).toBe("Basic " + Buffer.from(`:${pat}`, "utf-8").toString("base64"));
    expect(header).toMatch(/^Basic [A-Za-z0-9+/=]+$/);
  });

  it("trims whitespace from PAT", () => {
    const header = buildAuthHeader("  token  ");
    const expected = Buffer.from(":token", "utf-8").toString("base64");
    expect(header).toBe("Basic " + expected);
  });

  it("returns null for empty string", () => {
    expect(buildAuthHeader("")).toBeNull();
  });

  it("returns null for null or undefined", () => {
    expect(buildAuthHeader(null)).toBeNull();
    expect(buildAuthHeader(undefined)).toBeNull();
  });

  it("returns null for non-string", () => {
    expect(buildAuthHeader(123)).toBeNull();
  });
});

describe("buildWorkItemUrl", () => {
  it("constructs correct URL with $ prefix on work item type", () => {
    const url = buildWorkItemUrl("https://dev.azure.com/myorg", "MyProject", "User Story");
    expect(url).toBe(
      "https://dev.azure.com/myorg/MyProject/_apis/wit/workitems/$User%20Story?api-version=7.0"
    );
  });

  it("encodes project name with spaces", () => {
    const url = buildWorkItemUrl("https://dev.azure.com/myorg", "My Project", "Bug");
    expect(url).toContain("/My%20Project/");
    expect(url).toContain("/$Bug?");
  });

  it("strips trailing slash from org URL", () => {
    const url = buildWorkItemUrl("https://dev.azure.com/myorg/", "Proj", "Task");
    expect(url).toContain("https://dev.azure.com/myorg/Proj/");
    expect(url).not.toContain("myorg//");
  });

  it("handles work item type without spaces", () => {
    const url = buildWorkItemUrl("https://dev.azure.com/myorg", "Proj", "Bug");
    expect(url).toContain("/$Bug?");
  });
});

describe("buildTitle", () => {
  it("returns base title for version 1", () => {
    expect(buildTitle("Dashboard", 1)).toBe("Prototype: Dashboard");
  });

  it("appends version for version > 1", () => {
    expect(buildTitle("Dashboard", 2)).toBe("Prototype: Dashboard (v2)");
    expect(buildTitle("Dashboard", 5)).toBe("Prototype: Dashboard (v5)");
  });

  it("returns base title when version is null or undefined", () => {
    expect(buildTitle("Dashboard", null)).toBe("Prototype: Dashboard");
    expect(buildTitle("Dashboard", undefined)).toBe("Prototype: Dashboard");
  });

  it("returns base title when version is 0", () => {
    expect(buildTitle("Dashboard", 0)).toBe("Prototype: Dashboard");
  });

  it("includes page names when provided", () => {
    const pages = ["Home", "Tax Settings", "Compliance"];
    expect(buildTitle("Payroll", 1, pages)).toBe("Prototype: Payroll (Home, Tax Settings, Compliance)");
  });

  it("includes both page names and version", () => {
    const pages = ["Home", "Documents"];
    expect(buildTitle("Payroll", 2, pages)).toBe("Prototype: Payroll (Home, Documents) (v2)");
  });

  it("falls back to page count when full list would exceed 255 chars", () => {
    const pages = Array.from({ length: 30 }, (_, i) => `Very Long Page Name Number ${i + 1}`);
    const title = buildTitle("Payroll", 1, pages);
    expect(title).toBe("Prototype: Payroll (30 pages)");
    expect(title.length).toBeLessThanOrEqual(255);
  });

  it("ignores pageNames when fewer than 2", () => {
    expect(buildTitle("Dashboard", 1, ["Home"])).toBe("Prototype: Dashboard");
    expect(buildTitle("Dashboard", 1, [])).toBe("Prototype: Dashboard");
  });

  it("ignores null or undefined pageNames", () => {
    expect(buildTitle("Dashboard", 1, null)).toBe("Prototype: Dashboard");
    expect(buildTitle("Dashboard", 1, undefined)).toBe("Prototype: Dashboard");
  });
});

describe("extractPageNames", () => {
  it("returns null for single route", () => {
    expect(extractPageNames("/dashboard", "dashboard")).toBeNull();
  });

  it("returns null for null or empty route", () => {
    expect(extractPageNames(null, "payroll")).toBeNull();
    expect(extractPageNames("", "payroll")).toBeNull();
    expect(extractPageNames(undefined, "payroll")).toBeNull();
  });

  it("extracts page names from multi-route payroll slug", () => {
    const route = "/payroll, /payroll/tax-settings, /payroll/compliance, /payroll/documents, /payroll/labor-classes";
    const result = extractPageNames(route, "payroll");
    expect(result).toEqual(["Home", "Tax Settings", "Compliance", "Documents", "Labor Classes"]);
  });

  it("labels the base slug route as Home", () => {
    const route = "/settings, /settings/notifications";
    const result = extractPageNames(route, "settings");
    expect(result).toEqual(["Home", "Notifications"]);
  });

  it("title-cases kebab-case segments", () => {
    const route = "/app, /app/user-profile";
    const result = extractPageNames(route, "app");
    expect(result).toEqual(["Home", "User Profile"]);
  });

  it("handles nested slug paths", () => {
    const route = "/payroll/employees, /payroll/employees/details";
    const result = extractPageNames(route, "payroll/employees");
    expect(result).toEqual(["Home", "Details"]);
  });

  it("returns null for non-string route", () => {
    expect(extractPageNames(123, "payroll")).toBeNull();
    expect(extractPageNames({}, "payroll")).toBeNull();
  });
});

describe("buildWiqlQuery", () => {
  it("builds query with project and slug tag", () => {
    const wiql = buildWiqlQuery("MyProject", "dashboard-page");
    expect(wiql).toContain("[System.TeamProject] = 'MyProject'");
    expect(wiql).toContain("CONTAINS 'proto-ingested'");
    expect(wiql).toContain("CONTAINS 'slug:dashboard-page'");
    expect(wiql).toContain("ORDER BY [System.Id] DESC");
    expect(wiql).not.toContain("[System.Description] CONTAINS");
  });

  it("includes commit SHA in description search when provided", () => {
    const sha = "abc123def456";
    const wiql = buildWiqlQuery("MyProject", "dashboard-page", sha);
    expect(wiql).toContain(`[System.Description] CONTAINS '${sha}'`);
  });

  it("omits description clause when commitSha is null", () => {
    const wiql = buildWiqlQuery("MyProject", "dashboard-page", null);
    expect(wiql).not.toContain("[System.Description] CONTAINS");
  });

  it("omits description clause when commitSha is empty string", () => {
    const wiql = buildWiqlQuery("MyProject", "dashboard-page", "");
    expect(wiql).not.toContain("[System.Description] CONTAINS");
  });

  it("selects Id, Title, and Description fields", () => {
    const wiql = buildWiqlQuery("Proj", "slug");
    expect(wiql).toContain("SELECT [System.Id], [System.Title], [System.Description]");
  });

  it("escapes single quotes in slug values", () => {
    const wiql = buildWiqlQuery("Proj", "my-app's-page");
    expect(wiql).toContain("slug:my-app''s-page");
    expect(wiql).not.toContain("slug:my-app's-page");
  });

  it("escapes single quotes in project name", () => {
    const wiql = buildWiqlQuery("O'Brien's Project", "dashboard");
    expect(wiql).toContain("[System.TeamProject] = 'O''Brien''s Project'");
  });

  it("escapes single quotes in commitSha", () => {
    const wiql = buildWiqlQuery("Proj", "slug", "sha'inject");
    expect(wiql).toContain("CONTAINS 'sha''inject'");
  });
});

describe("buildWorkItemPayload", () => {
  it("includes slug tag in tags field", () => {
    const prototype = { name: "Dashboard", slug: "dashboard-page" };
    const payload = buildWorkItemPayload(prototype);
    const tagsOp = payload.find((p) => p.path === "/fields/System.Tags");
    expect(tagsOp.value).toBe("proto-ingested; slug:dashboard-page");
  });

  it("omits slug tag when slug is empty", () => {
    const prototype = { name: "Dashboard" };
    const payload = buildWorkItemPayload(prototype);
    const tagsOp = payload.find((p) => p.path === "/fields/System.Tags");
    expect(tagsOp.value).toBe("proto-ingested");
  });

  it("includes commit SHA in description when provided", () => {
    const prototype = { name: "Dashboard", slug: "dashboard-page" };
    const payload = buildWorkItemPayload(prototype, { commitSha: "abc123" });
    const descOp = payload.find((p) => p.path === "/fields/System.Description");
    expect(descOp.value).toContain("abc123");
    expect(descOp.value).toContain("data-commit-sha");
  });

  it("uses versioned title when version > 1", () => {
    const prototype = { name: "Dashboard", slug: "dashboard-page" };
    const payload = buildWorkItemPayload(prototype, { version: 3 });
    const titleOp = payload.find((p) => p.path === "/fields/System.Title");
    expect(titleOp.value).toBe("Prototype: Dashboard (v3)");
  });

  it("uses base title for version 1", () => {
    const prototype = { name: "Dashboard", slug: "dashboard-page" };
    const payload = buildWorkItemPayload(prototype, { version: 1 });
    const titleOp = payload.find((p) => p.path === "/fields/System.Title");
    expect(titleOp.value).toBe("Prototype: Dashboard");
  });

  it("returns correct patch operations structure", () => {
    const prototype = {
      name: "Dashboard",
      slug: "dashboard-page",
      metadata: { components: ["Card"], interactiveElements: [] },
    };
    const payload = buildWorkItemPayload(prototype);

    expect(Array.isArray(payload)).toBe(true);

    const titleOp = payload.find((p) => p.path === "/fields/System.Title");
    expect(titleOp).toBeDefined();
    expect(titleOp.op).toBe("add");
    expect(titleOp.value).toBe("Prototype: Dashboard");

    const descOp = payload.find((p) => p.path === "/fields/System.Description");
    expect(descOp).toBeDefined();
    expect(descOp.op).toBe("add");
    expect(descOp.value).toContain("Card");

    const tagsOp = payload.find((p) => p.path === "/fields/System.Tags");
    expect(tagsOp).toBeDefined();
    expect(tagsOp.value).toContain("proto-ingested");
  });

  it("returns exact operation count with all optional fields", () => {
    const prototype = { name: "Foo", slug: "foo" };
    const payload = buildWorkItemPayload(prototype, {
      areaPath: "Lista",
      iterationPath: "Lista",
    });
    expect(payload).toHaveLength(5);
    const paths = payload.map((p) => p.path);
    expect(paths).toContain("/fields/System.Title");
    expect(paths).toContain("/fields/System.Description");
    expect(paths).toContain("/fields/System.Tags");
    expect(paths).toContain("/fields/System.AreaPath");
    expect(paths).toContain("/fields/System.IterationPath");
  });

  it("returns 3 operations with no optional fields", () => {
    const prototype = { name: "Foo", slug: "foo" };
    const payload = buildWorkItemPayload(prototype);
    expect(payload).toHaveLength(3);
  });

  it("includes AreaPath when provided", () => {
    const prototype = { name: "Foo", slug: "foo" };
    const payload = buildWorkItemPayload(prototype, { areaPath: "Project/Team/Area" });
    const areaOp = payload.find((p) => p.path === "/fields/System.AreaPath");
    expect(areaOp).toBeDefined();
    expect(areaOp.value).toBe("Project/Team/Area");
  });

  it("omits AreaPath when empty or not provided", () => {
    const prototype = { name: "Foo", slug: "foo" };
    const payloadWithEmpty = buildWorkItemPayload(prototype, { areaPath: "" });
    const payloadWithNull = buildWorkItemPayload(prototype, { areaPath: null });

    expect(payloadWithEmpty.find((p) => p.path === "/fields/System.AreaPath")).toBeUndefined();
    expect(payloadWithNull.find((p) => p.path === "/fields/System.AreaPath")).toBeUndefined();
  });

  it("includes IterationPath when provided", () => {
    const prototype = { name: "Foo", slug: "foo" };
    const payload = buildWorkItemPayload(prototype, { iterationPath: "Lista" });
    const iterOp = payload.find((p) => p.path === "/fields/System.IterationPath");
    expect(iterOp).toBeDefined();
    expect(iterOp.op).toBe("add");
    expect(iterOp.value).toBe("Lista");
  });

  it("omits IterationPath when empty or not provided", () => {
    const prototype = { name: "Foo", slug: "foo" };
    const payloadNoIter = buildWorkItemPayload(prototype);
    const payloadEmptyIter = buildWorkItemPayload(prototype, { iterationPath: "" });
    const payloadNullIter = buildWorkItemPayload(prototype, { iterationPath: null });

    expect(payloadNoIter.find((p) => p.path === "/fields/System.IterationPath")).toBeUndefined();
    expect(payloadEmptyIter.find((p) => p.path === "/fields/System.IterationPath")).toBeUndefined();
    expect(payloadNullIter.find((p) => p.path === "/fields/System.IterationPath")).toBeUndefined();
  });

  it("does not include read-only board fields", () => {
    const prototype = { name: "Foo", slug: "foo" };
    const payload = buildWorkItemPayload(prototype, { areaPath: "Lista", iterationPath: "Lista" });
    const paths = payload.map((p) => p.path);
    expect(paths).not.toContain("/fields/System.BoardLane");
    expect(paths).not.toContain("/fields/System.BoardColumn");
  });

  it("uses slug when name is missing", () => {
    const prototype = { slug: "dashboard-page" };
    const payload = buildWorkItemPayload(prototype);
    const titleOp = payload.find((p) => p.path === "/fields/System.Title");
    expect(titleOp.value).toBe("Prototype: dashboard-page");
  });

  it("falls back to Unnamed when both name and slug missing", () => {
    const payload = buildWorkItemPayload({});
    const titleOp = payload.find((p) => p.path === "/fields/System.Title");
    expect(titleOp.value).toBe("Prototype: Unnamed");
  });

  it("enriches title with page names for multi-route slugs", () => {
    const prototype = { name: "Payroll", slug: "payroll" };
    const payload = buildWorkItemPayload(prototype, {
      route: "/payroll, /payroll/tax-settings, /payroll/compliance",
    });
    const titleOp = payload.find((p) => p.path === "/fields/System.Title");
    expect(titleOp.value).toBe("Prototype: Payroll (Home, Tax Settings, Compliance)");
  });

  it("keeps simple title for single-route slugs", () => {
    const prototype = { name: "Dashboard", slug: "dashboard" };
    const payload = buildWorkItemPayload(prototype, { route: "/dashboard" });
    const titleOp = payload.find((p) => p.path === "/fields/System.Title");
    expect(titleOp.value).toBe("Prototype: Dashboard");
  });

  it("enriches title with page names and version for multi-route versioned slugs", () => {
    const prototype = { name: "Payroll", slug: "payroll" };
    const payload = buildWorkItemPayload(prototype, {
      route: "/payroll, /payroll/tax-settings",
      version: 3,
    });
    const titleOp = payload.find((p) => p.path === "/fields/System.Title");
    expect(titleOp.value).toBe("Prototype: Payroll (Home, Tax Settings) (v3)");
  });

  it("passes route, sourceUrl, previousVersion, and attachmentUrls to description", () => {
    const prototype = {
      name: "Dashboard",
      slug: "dashboard-page",
      metadata: { components: [{ name: "Card" }], interactiveElements: [] },
      screenshots: ["screenshots/dashboard.png"],
    };
    const payload = buildWorkItemPayload(prototype, {
      route: "/dashboard",
      sourceUrl: "https://github.com/org/repo/tree/abc123/src/pages/dashboard-page",
      previousVersion: { id: 5, url: "https://ado/proj/_workitems/edit/5" },
      attachmentUrls: ["https://ado/_apis/wit/attachments/guid1"],
    });
    const descOp = payload.find((p) => p.path === "/fields/System.Description");
    expect(descOp.value).toContain("Route:");
    expect(descOp.value).toContain("/dashboard");
    expect(descOp.value).toContain("Source:");
    expect(descOp.value).toContain("https://github.com/org/repo/tree/abc123/src/pages/dashboard-page");
    expect(descOp.value).toContain("Previous versions");
    expect(descOp.value).toContain("Work item 5");
    expect(descOp.value).toContain("https://ado/_apis/wit/attachments/guid1");
  });
});

describe("renderComponentTree", () => {
  it("returns empty string for empty array", () => {
    expect(renderComponentTree([])).toBe("");
  });

  it("returns empty string for non-array", () => {
    expect(renderComponentTree(null)).toBe("");
    expect(renderComponentTree(undefined)).toBe("");
  });

  it("renders string components as flat list items", () => {
    const html = renderComponentTree(["ModusCard", "ModusButton"]);
    expect(html).toContain("<li>ModusCard</li>");
    expect(html).toContain("<li>ModusButton</li>");
    expect(html).toMatch(/^<ul>.*<\/ul>$/);
  });

  it("renders object components with name", () => {
    const html = renderComponentTree([{ name: "ModusCard" }]);
    expect(html).toContain("<li>ModusCard</li>");
  });

  it("renders props alongside component name", () => {
    const html = renderComponentTree([
      { name: "ModusTextInput", props: { label: "Company Name" } },
    ]);
    expect(html).toContain("ModusTextInput");
    expect(html).toContain("label:");
    expect(html).toContain("Company Name");
  });

  it("omits empty/null/undefined prop values", () => {
    const html = renderComponentTree([
      { name: "ModusCard", props: { title: "Hello", empty: "", nul: null, undef: undefined } },
    ]);
    expect(html).toContain("title:");
    expect(html).not.toContain("empty:");
    expect(html).not.toContain("nul:");
    expect(html).not.toContain("undef:");
  });

  it("renders nested children as nested <ul>", () => {
    const html = renderComponentTree([
      {
        name: "Root",
        children: [
          { name: "Child1" },
          { name: "Child2", children: [{ name: "Grandchild" }] },
        ],
      },
    ]);
    expect(html).toContain("Root");
    expect(html).toContain("Child1");
    expect(html).toContain("Grandchild");
    const nestedUlCount = (html.match(/<ul>/g) || []).length;
    expect(nestedUlCount).toBeGreaterThanOrEqual(3);
  });

  it("escapes HTML in component names and props", () => {
    const html = renderComponentTree([
      { name: "<script>", props: { label: "a & b" } },
    ]);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("a &amp; b");
    expect(html).not.toContain("<script>");
  });
});

describe("formatInteractiveElement", () => {
  it("formats string element", () => {
    expect(formatInteractiveElement("Click me")).toBe("Click me");
  });

  it("formats element with type and label", () => {
    const result = formatInteractiveElement({ type: "button", label: "Save" });
    expect(result).toContain("button");
    expect(result).toContain("Save");
  });

  it("formats element with type, label, and position", () => {
    const result = formatInteractiveElement({ type: "input", label: "Search", position: "header" });
    expect(result).toContain("input");
    expect(result).toContain("Search");
    expect(result).toContain("header");
  });

  it("falls back to selector when label is missing", () => {
    const result = formatInteractiveElement({ selector: ".submit-btn" });
    expect(result).toContain(".submit-btn");
  });

  it("escapes HTML", () => {
    const result = formatInteractiveElement({ type: "<b>bold</b>", label: "a & b" });
    expect(result).toContain("&lt;b&gt;");
    expect(result).toContain("&amp;");
  });

  it("returns fallback for empty object", () => {
    expect(formatInteractiveElement({})).toBe("(unknown element)");
  });
});

describe("formatDescription", () => {
  it("includes component hierarchy with nested structure", () => {
    const prototype = {
      metadata: {
        components: [
          {
            name: "ModusCard",
            props: { header: "Title" },
            children: [{ name: "ModusButton", props: { text: "Save" } }],
          },
        ],
        interactiveElements: [],
      },
    };
    const html = formatDescription(prototype);
    expect(html).toContain("Component hierarchy");
    expect(html).toContain("ModusCard");
    expect(html).toContain("ModusButton");
    expect(html).toContain("header:");
    expect(html).toContain("text:");
  });

  it("includes interactive elements with type and label", () => {
    const prototype = {
      metadata: {
        components: [],
        interactiveElements: [
          { type: "button", label: "Submit", position: "footer" },
          { type: "input", label: "Email", position: "form" },
        ],
      },
    };
    const html = formatDescription(prototype);
    expect(html).toContain("Interactive elements");
    expect(html).toContain("button");
    expect(html).toContain("Submit");
    expect(html).toContain("footer");
    expect(html).toContain("input");
    expect(html).toContain("Email");
  });

  it("includes screenshot references", () => {
    const prototype = {
      screenshots: ["screenshots/dashboard-page.png", "screenshots/step-2.png"],
      metadata: {},
    };
    const html = formatDescription(prototype);
    expect(html).toContain("Screenshots");
    expect(html).toContain("dashboard-page.png");
    expect(html).toContain("step-2.png");
  });

  it("returns fallback message for empty metadata and no name", () => {
    const html = formatDescription({});
    expect(html).toContain("No metadata available");
  });

  it("shows prototype name header when name is present", () => {
    const html = formatDescription({ name: "Dashboard", slug: "dashboard-page" });
    expect(html).toContain("Prototype: Dashboard");
  });

  it("handles null or undefined prototype", () => {
    expect(formatDescription(null)).toContain("No metadata available");
    expect(formatDescription(undefined)).toContain("No metadata available");
  });

  it("escapes HTML in component names", () => {
    const prototype = {
      metadata: {
        components: ["<script>alert(1)</script>", "Normal & safe"],
        interactiveElements: [],
      },
    };
    const html = formatDescription(prototype);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
  });

  it("handles object components with name property", () => {
    const prototype = {
      metadata: {
        components: [{ name: "CustomComponent" }],
        interactiveElements: [],
      },
    };
    const html = formatDescription(prototype);
    expect(html).toContain("CustomComponent");
  });

  it("falls back to selector when interactive element has no label", () => {
    const prototype = {
      metadata: {
        components: [],
        interactiveElements: [{ selector: ".submit-btn" }],
      },
    };
    const html = formatDescription(prototype);
    expect(html).toContain(".submit-btn");
  });

  it("extracts basename from full screenshot paths", () => {
    const prototype = {
      screenshots: ["screenshots/deep/nested/payroll-step-3.png"],
      metadata: {},
    };
    const html = formatDescription(prototype);
    expect(html).toContain("payroll-step-3.png");
    expect(html).not.toContain("deep/nested");
  });

  it("backward compat: accepts string as second arg for commitSha", () => {
    const prototype = { metadata: { components: ["Card"], interactiveElements: [] } };
    const html = formatDescription(prototype, "abc123def456");
    expect(html).toContain("abc123def456");
    expect(html).toContain('data-commit-sha="abc123def456"');
    expect(html).toContain("Commit:");
    expect(html).toContain("<code>abc123def456</code>");
  });

  it("includes commit SHA via options object", () => {
    const prototype = { metadata: { components: ["Card"], interactiveElements: [] } };
    const html = formatDescription(prototype, { commitSha: "sha456" });
    expect(html).toContain('data-commit-sha="sha456"');
    expect(html).toContain("Commit:");
  });

  it("omits commit SHA section when not provided", () => {
    const prototype = { metadata: { components: ["Card"], interactiveElements: [] } };
    const html = formatDescription(prototype);
    expect(html).not.toContain("data-commit-sha");
    expect(html).not.toContain("Commit:");
  });

  it("escapes HTML in commit SHA value", () => {
    const html = formatDescription({}, { commitSha: '<script>alert("xss")</script>' });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("places commit SHA before component hierarchy", () => {
    const prototype = { metadata: { components: ["Card"], interactiveElements: [] } };
    const html = formatDescription(prototype, { commitSha: "sha123" });
    const shaIndex = html.indexOf("sha123");
    const compIndex = html.indexOf("Component hierarchy");
    expect(shaIndex).toBeLessThan(compIndex);
  });

  it("includes source URL as link", () => {
    const prototype = { name: "Dashboard", slug: "dashboard-page" };
    const html = formatDescription(prototype, {
      sourceUrl: "https://github.com/org/repo/tree/abc123/src/pages/dashboard-page",
    });
    expect(html).toContain("Source:");
    expect(html).toContain('href="https://github.com/org/repo/tree/abc123/src/pages/dashboard-page"');
  });

  it("includes route as code block", () => {
    const prototype = { name: "Dashboard", slug: "dashboard-page" };
    const html = formatDescription(prototype, { route: "/dashboard" });
    expect(html).toContain("Route:");
    expect(html).toContain("<code>/dashboard</code>");
  });

  it("includes previous version link", () => {
    const prototype = { name: "Dashboard", slug: "dashboard-page" };
    const html = formatDescription(prototype, {
      previousVersion: { id: 42, url: "https://dev.azure.com/org/proj/_workitems/edit/42" },
    });
    expect(html).toContain("Previous versions");
    expect(html).toContain('href="https://dev.azure.com/org/proj/_workitems/edit/42"');
    expect(html).toContain("Work item 42");
  });

  it("includes attachment URLs as links in screenshots section", () => {
    const prototype = {
      screenshots: ["screenshots/dashboard.png"],
      metadata: {},
    };
    const html = formatDescription(prototype, {
      attachmentUrls: ["https://dev.azure.com/org/_apis/wit/attachments/guid1"],
    });
    expect(html).toContain("Screenshots");
    expect(html).toContain('href="https://dev.azure.com/org/_apis/wit/attachments/guid1"');
    expect(html).toContain("dashboard.png");
  });

  it("renders screenshots without URLs as plain text", () => {
    const prototype = {
      screenshots: ["screenshots/dashboard.png"],
      metadata: {},
    };
    const html = formatDescription(prototype, { attachmentUrls: [] });
    expect(html).toContain("dashboard.png");
    expect(html).not.toContain("href=");
  });

  it("renders full spec-compliant description with all fields", () => {
    const prototype = {
      name: "Payroll Setup",
      slug: "payroll-setup",
      metadata: {
        components: [
          {
            name: "PayrollSetupPage",
            children: [
              {
                name: "ModusCard",
                children: [
                  { name: "ModusTextInput", props: { label: "Company Name" } },
                ],
              },
              { name: "ModusButton", props: { text: "Next" } },
            ],
          },
        ],
        interactiveElements: [
          { type: "input", label: "Company Name", position: "form" },
          { type: "button", label: "Next", position: "footer" },
        ],
      },
      screenshots: ["screenshots/payroll-setup.png"],
    };
    const html = formatDescription(prototype, {
      commitSha: "abc123",
      route: "/payroll/setup",
      sourceUrl: "https://github.com/org/repo/tree/abc123/src/pages/payroll-setup",
      previousVersion: { id: 10, url: "https://dev.azure.com/org/proj/_workitems/edit/10" },
      attachmentUrls: ["https://dev.azure.com/org/_apis/wit/attachments/guid1"],
    });

    expect(html).toContain("Prototype: Payroll Setup");
    expect(html).toContain("Source:");
    expect(html).toContain("Commit:");
    expect(html).toContain("abc123");
    expect(html).toContain("Route:");
    expect(html).toContain("/payroll/setup");
    expect(html).toContain("Component hierarchy");
    expect(html).toContain("PayrollSetupPage");
    expect(html).toContain("Company Name");
    expect(html).toContain("Interactive elements");
    expect(html).toContain("input");
    expect(html).toContain("button");
    expect(html).toContain("Screenshots");
    expect(html).toContain("payroll-setup.png");
    expect(html).toContain("Previous versions");
    expect(html).toContain("Work item 10");
  });

  it("section order: name, source, commit, route, components, elements, screenshots, previous", () => {
    const prototype = {
      name: "Test",
      slug: "test",
      metadata: {
        components: [{ name: "Comp" }],
        interactiveElements: [{ type: "button", label: "Click" }],
      },
      screenshots: ["screenshots/test.png"],
    };
    const html = formatDescription(prototype, {
      commitSha: "sha1",
      route: "/test",
      sourceUrl: "https://github.com/x",
      previousVersion: { id: 1, url: "https://ado/1" },
      attachmentUrls: ["https://ado/att/1"],
    });

    const nameIdx = html.indexOf("Prototype: Test");
    const sourceIdx = html.indexOf("Source:");
    const commitIdx = html.indexOf("Commit:");
    const routeIdx = html.indexOf("Route:");
    const compIdx = html.indexOf("Component hierarchy");
    const elemIdx = html.indexOf("Interactive elements");
    const ssIdx = html.indexOf("Screenshots");
    const prevIdx = html.indexOf("Previous versions");

    expect(nameIdx).toBeLessThan(sourceIdx);
    expect(sourceIdx).toBeLessThan(commitIdx);
    expect(commitIdx).toBeLessThan(routeIdx);
    expect(routeIdx).toBeLessThan(compIdx);
    expect(compIdx).toBeLessThan(elemIdx);
    expect(elemIdx).toBeLessThan(ssIdx);
    expect(ssIdx).toBeLessThan(prevIdx);
  });
});

describe("runWiqlQuery", () => {
  const ORG = "https://dev.azure.com/myorg";
  const PROJECT = "MyProject";
  const AUTH = "Basic dGVzdA==";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends POST with correct URL and body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workItems: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const wiql = "SELECT [System.Id] FROM WorkItems";
    await runWiqlQuery(ORG, PROJECT, wiql, AUTH);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://dev.azure.com/myorg/MyProject/_apis/wit/wiql?api-version=7.0");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ query: wiql });
    expect(opts.headers["Content-Type"]).toBe("application/json");
    expect(opts.headers.Authorization).toBe(AUTH);
  });

  it("returns workItems from response", async () => {
    const items = [{ id: 1, url: "http://x/1" }, { id: 2, url: "http://x/2" }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workItems: items }),
    }));

    const result = await runWiqlQuery(ORG, PROJECT, "query", AUTH);
    expect(result).toEqual(items);
  });

  it("returns empty array when workItems is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }));

    const result = await runWiqlQuery(ORG, PROJECT, "query", AUTH);
    expect(result).toEqual([]);
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve("Bad query"),
    }));

    await expect(runWiqlQuery(ORG, PROJECT, "bad", AUTH)).rejects.toThrow("WIQL query failed 400: Bad query");
  });
});

describe("checkIdempotency", () => {
  const ORG = "https://dev.azure.com/myorg";
  const PROJECT = "MyProject";
  const AUTH = "Basic dGVzdA==";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when commitSha is null", async () => {
    const result = await checkIdempotency(ORG, PROJECT, "slug", null, AUTH);
    expect(result).toBeNull();
  });

  it("returns null when commitSha is empty string", async () => {
    const result = await checkIdempotency(ORG, PROJECT, "slug", "", AUTH);
    expect(result).toBeNull();
  });

  it("returns first matching work item when found", async () => {
    const item = { id: 42, url: "http://x/42" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workItems: [item, { id: 43, url: "http://x/43" }] }),
    }));

    const result = await checkIdempotency(ORG, PROJECT, "dashboard", "sha123", AUTH);
    expect(result).toEqual(item);
  });

  it("returns null when no matching work items", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workItems: [] }),
    }));

    const result = await checkIdempotency(ORG, PROJECT, "dashboard", "sha123", AUTH);
    expect(result).toBeNull();
  });

  it("passes commit SHA to WIQL query", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workItems: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await checkIdempotency(ORG, PROJECT, "dashboard", "abc123def", AUTH);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.query).toContain("abc123def");
    expect(body.query).toContain("slug:dashboard");
  });
});

describe("detectVersion", () => {
  const ORG = "https://dev.azure.com/myorg";
  const PROJECT = "MyProject";
  const AUTH = "Basic dGVzdA==";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns version 1 with no previousId when no items exist", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workItems: [] }),
    }));

    const result = await detectVersion(ORG, PROJECT, "dashboard", AUTH);
    expect(result).toEqual({ nextVersion: 1, previousId: null });
  });

  it("returns version 2 with previousId when one item exists", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workItems: [{ id: 100, url: "http://x/100" }] }),
    }));

    const result = await detectVersion(ORG, PROJECT, "dashboard", AUTH);
    expect(result).toEqual({ nextVersion: 2, previousId: 100 });
  });

  it("returns version 4 when three items exist", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        workItems: [
          { id: 300, url: "http://x/300" },
          { id: 200, url: "http://x/200" },
          { id: 100, url: "http://x/100" },
        ],
      }),
    }));

    const result = await detectVersion(ORG, PROJECT, "dashboard", AUTH);
    expect(result).toEqual({ nextVersion: 4, previousId: 300 });
  });

  it("does not include commit SHA in the WIQL query", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workItems: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await detectVersion(ORG, PROJECT, "dashboard", AUTH);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.query).not.toContain("[System.Description] CONTAINS");
    expect(body.query).toContain("slug:dashboard");
  });

  it("propagates WIQL query errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal error"),
    }));

    await expect(detectVersion(ORG, PROJECT, "dashboard", AUTH)).rejects.toThrow("WIQL query failed 500");
  });
});

describe("addRelatedLink", () => {
  const ORG = "https://dev.azure.com/myorg";
  const PROJECT = "MyProject";
  const AUTH = "Basic dGVzdA==";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends PATCH with Related link payload", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await addRelatedLink(ORG, PROJECT, 200, 100, AUTH);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://dev.azure.com/myorg/MyProject/_apis/wit/workitems/200?api-version=7.0");
    expect(opts.method).toBe("PATCH");
    expect(opts.headers["Content-Type"]).toBe("application/json-patch+json");

    const body = JSON.parse(opts.body);
    expect(body).toHaveLength(1);
    expect(body[0].op).toBe("add");
    expect(body[0].path).toBe("/relations/-");
    expect(body[0].value.rel).toBe("System.LinkTypes.Related");
    expect(body[0].value.url).toContain("/workitems/100");
    expect(body[0].value.attributes.comment).toBe("Previous prototype version");
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Not found"),
    }));

    await expect(addRelatedLink(ORG, PROJECT, 200, 999, AUTH)).rejects.toThrow("ADO link add 404: Not found");
  });
});

describe("escapeWiql", () => {
  it("returns string unchanged when no single quotes", () => {
    expect(escapeWiql("dashboard-page")).toBe("dashboard-page");
  });

  it("doubles single quotes", () => {
    expect(escapeWiql("my-app's-page")).toBe("my-app''s-page");
  });

  it("handles multiple single quotes", () => {
    expect(escapeWiql("it's a 'test'")).toBe("it''s a ''test''");
  });

  it("handles empty string", () => {
    expect(escapeWiql("")).toBe("");
  });

  it("coerces non-string to string", () => {
    expect(escapeWiql(123)).toBe("123");
    expect(escapeWiql(null)).toBe("null");
  });
});

describe("formatDescription previousVersion guard", () => {
  it("skips previous versions section when id is 0", () => {
    const html = formatDescription({ name: "Test" }, {
      previousVersion: { id: 0, url: "" },
    });
    expect(html).not.toContain("Previous versions");
  });

  it("skips previous versions section when id is null", () => {
    const html = formatDescription({ name: "Test" }, {
      previousVersion: { id: null, url: "https://ado/1" },
    });
    expect(html).not.toContain("Previous versions");
  });

  it("skips previous versions section when id is undefined", () => {
    const html = formatDescription({ name: "Test" }, {
      previousVersion: { url: "https://ado/1" },
    });
    expect(html).not.toContain("Previous versions");
  });

  it("renders previous versions section when id is valid", () => {
    const html = formatDescription({ name: "Test" }, {
      previousVersion: { id: 42, url: "https://ado/42" },
    });
    expect(html).toContain("Previous versions");
    expect(html).toContain("Work item 42");
  });
});

describe("uploadScreenshots", () => {
  const ORG = "https://dev.azure.com/myorg";
  const PROJECT = "MyProject";
  const AUTH = "Basic dGVzdA==";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null for missing files", async () => {
    const result = await uploadScreenshots(
      ["nonexistent/file.png"],
      ORG, PROJECT, AUTH
    );
    expect(result).toEqual([null]);
  });

  it("returns null for failed uploads and maintains index alignment", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bd-test-"));
    const fileA = path.join(tmpDir, "a.png");
    const fileB = path.join(tmpDir, "b.png");
    fs.writeFileSync(fileA, "img-a");
    fs.writeFileSync(fileB, "img-b");

    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("err") })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ url: "https://att/2" }) })
    );

    try {
      const result = await uploadScreenshots([fileA, fileB], ORG, PROJECT, AUTH);
      expect(result).toEqual([null, "https://att/2"]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns attachment URLs for successful uploads", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bd-test-"));
    const file = path.join(tmpDir, "test.png");
    fs.writeFileSync(file, "img-data");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://att/guid" }),
    }));

    try {
      const result = await uploadScreenshots([file], ORG, PROJECT, AUTH);
      expect(result).toEqual(["https://att/guid"]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns empty array for empty screenshots", async () => {
    const result = await uploadScreenshots([], ORG, PROJECT, AUTH);
    expect(result).toEqual([]);
  });
});

describe("linkAttachments", () => {
  const ORG = "https://dev.azure.com/myorg";
  const PROJECT = "MyProject";
  const AUTH = "Basic dGVzdA==";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips null entries", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await linkAttachments([null, "https://att/1", null], ORG, PROJECT, 100, AUTH);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("links all non-null attachments", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await linkAttachments(["https://att/1", "https://att/2"], ORG, PROJECT, 100, AUTH);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("continues on failure and warns", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("err") })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", mockFetch);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await linkAttachments(["https://att/1", "https://att/2"], ORG, PROJECT, 100, AUTH);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("does nothing for empty array", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    await linkAttachments([], ORG, PROJECT, 100, AUTH);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("processPrototype", () => {
  const ORG = "https://dev.azure.com/myorg";
  const PROJECT = "MyProject";
  const AUTH = "Basic dGVzdA==";
  const BASE_CONFIG = {
    orgUrl: ORG,
    project: PROJECT,
    workItemType: "User Story",
    areaPath: "Lista",
    iterationPath: "",
    authHeader: AUTH,
    commitSha: "abc123",
    repoUrl: "https://github.com/org/repo",
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns skipped when idempotency check finds existing item", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workItems: [{ id: 50, url: "http://x/50" }] }),
    }));

    const result = await processPrototype(
      { name: "Dashboard", slug: "dashboard" },
      "dashboard",
      BASE_CONFIG
    );

    expect(result.action).toBe("skipped");
    expect(result.id).toBe(50);
  });

  it("creates v1 work item when no prior versions exist", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 100, _links: { html: { href: "https://ado/100" } } }),
      });
    vi.stubGlobal("fetch", mockFetch);

    const result = await processPrototype(
      { name: "Dashboard", slug: "dashboard", metadata: { components: [], interactiveElements: [] } },
      "dashboard",
      BASE_CONFIG
    );

    expect(result.action).toBe("created");
    expect(result.id).toBe(100);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("creates versioned work item and links to previous", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [{ id: 50, url: "http://x/50" }] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 200, _links: { html: { href: "https://ado/200" } } }),
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    const result = await processPrototype(
      { name: "Dashboard", slug: "dashboard", metadata: { components: [], interactiveElements: [] } },
      "dashboard",
      BASE_CONFIG
    );

    expect(result.action).toBe("created-v2");
    expect(result.id).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(4);

    const linkCall = mockFetch.mock.calls[3];
    expect(linkCall[1].method).toBe("PATCH");
    const linkBody = JSON.parse(linkCall[1].body);
    expect(linkBody[0].value.rel).toBe("System.LinkTypes.Related");
  });

  it("includes route and sourceUrl in work item description", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 100, _links: { html: { href: "https://ado/100" } } }),
      });
    vi.stubGlobal("fetch", mockFetch);

    await processPrototype(
      { name: "Dashboard", slug: "dashboard", route: "/dashboard", metadata: { components: [], interactiveElements: [] } },
      "dashboard",
      BASE_CONFIG
    );

    const createCall = mockFetch.mock.calls[2];
    const payload = JSON.parse(createCall[1].body);
    const descOp = payload.find((p) => p.path === "/fields/System.Description");
    expect(descOp.value).toContain("Route:");
    expect(descOp.value).toContain("/dashboard");
    expect(descOp.value).toContain("Source:");
    expect(descOp.value).toContain("https://github.com/org/repo/tree/abc123/src/pages/dashboard");
  });

  it("warns but continues when related link fails", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [{ id: 50, url: "http://x/50" }] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 200, _links: { html: { href: "https://ado/200" } } }),
      })
      .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("Server error") });
    vi.stubGlobal("fetch", mockFetch);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await processPrototype(
      { name: "Dashboard", slug: "dashboard", metadata: { components: [], interactiveElements: [] } },
      "dashboard",
      BASE_CONFIG
    );

    expect(result.action).toBe("created-v2");
    expect(warnSpy).toHaveBeenCalled();
  });

  it("sets board position after creating a work item when boardFields and boardPlacement are provided", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 300, _links: { html: { href: "https://ado/300" } } }),
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", mockFetch);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const configWithBoard = {
      ...BASE_CONFIG,
      boardFields: {
        columnField: "WEF_ABC123_Kanban.Column",
        rowField: "WEF_ABC123_Kanban.Lane",
      },
      boardPlacement: { column: "Input Q", lane: "UI Prototype" },
    };

    const result = await processPrototype(
      { name: "Dashboard", slug: "dashboard", metadata: { components: [], interactiveElements: [] } },
      "dashboard",
      configWithBoard
    );

    expect(result.action).toBe("created");
    expect(result.id).toBe(300);
    expect(mockFetch).toHaveBeenCalledTimes(4);

    const boardCall = mockFetch.mock.calls[3];
    expect(boardCall[0]).toContain("/workitems/300");
    expect(boardCall[1].method).toBe("PATCH");
    const body = JSON.parse(boardCall[1].body);
    expect(body).toHaveLength(2);
    expect(body[0].path).toBe("/fields/WEF_ABC123_Kanban.Column");
    expect(body[0].value).toBe("Input Q");
    expect(body[1].path).toBe("/fields/WEF_ABC123_Kanban.Lane");
    expect(body[1].value).toBe("UI Prototype");

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Board position set for 300"));
  });

  it("warns but continues when board position update fails", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 400, _links: { html: { href: "https://ado/400" } } }),
      })
      .mockResolvedValueOnce({ ok: false, status: 403, text: () => Promise.resolve("Forbidden") });
    vi.stubGlobal("fetch", mockFetch);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const configWithBoard = {
      ...BASE_CONFIG,
      boardFields: {
        columnField: "WEF_ABC123_Kanban.Column",
        rowField: "WEF_ABC123_Kanban.Lane",
      },
      boardPlacement: { column: "Input Q", lane: "UI Prototype" },
    };

    const result = await processPrototype(
      { name: "Dashboard", slug: "dashboard", metadata: { components: [], interactiveElements: [] } },
      "dashboard",
      configWithBoard
    );

    expect(result.action).toBe("created");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to set board position"));
  });

  it("skips board position when boardFields or boardPlacement are not set", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ workItems: [] }) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 500, _links: { html: { href: "https://ado/500" } } }),
      });
    vi.stubGlobal("fetch", mockFetch);

    const result = await processPrototype(
      { name: "Dashboard", slug: "dashboard", metadata: { components: [], interactiveElements: [] } },
      "dashboard",
      BASE_CONFIG
    );

    expect(result.action).toBe("created");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});

describe("fetchBoardConfig", () => {
  const ORG = "https://dev.azure.com/myorg";
  const PROJECT = "MyProject";
  const TEAM = "MyTeam";
  const BOARD = "Stories";
  const AUTH = "Basic dGVzdA==";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends GET to the correct board API URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        fields: {
          columnField: { referenceName: "WEF_ABC_Kanban.Column" },
          rowField: { referenceName: "WEF_ABC_Kanban.Lane" },
        },
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchBoardConfig(ORG, PROJECT, TEAM, BOARD, AUTH);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://dev.azure.com/myorg/MyProject/MyTeam/_apis/work/boards/Stories?api-version=7.0");
    expect(opts.method).toBe("GET");
    expect(opts.headers.Authorization).toBe(AUTH);
  });

  it("returns columnField and rowField reference names", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        fields: {
          columnField: { referenceName: "WEF_B086_Kanban.Column" },
          rowField: { referenceName: "WEF_B086_Kanban.Lane" },
        },
      }),
    }));

    const result = await fetchBoardConfig(ORG, PROJECT, TEAM, BOARD, AUTH);
    expect(result).toEqual({
      columnField: "WEF_B086_Kanban.Column",
      rowField: "WEF_B086_Kanban.Lane",
    });
  });

  it("returns null when both fields are missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ fields: {} }),
    }));

    const result = await fetchBoardConfig(ORG, PROJECT, TEAM, BOARD, AUTH);
    expect(result).toBeNull();
  });

  it("returns partial result when only columnField is present", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        fields: {
          columnField: { referenceName: "WEF_X_Kanban.Column" },
        },
      }),
    }));

    const result = await fetchBoardConfig(ORG, PROJECT, TEAM, BOARD, AUTH);
    expect(result).toEqual({
      columnField: "WEF_X_Kanban.Column",
      rowField: null,
    });
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Board not found"),
    }));

    await expect(fetchBoardConfig(ORG, PROJECT, TEAM, BOARD, AUTH)).rejects.toThrow(
      "Board config fetch failed 404: Board not found"
    );
  });

  it("encodes team name with spaces in URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        fields: {
          columnField: { referenceName: "WEF_X_Kanban.Column" },
          rowField: { referenceName: "WEF_X_Kanban.Lane" },
        },
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchBoardConfig(ORG, PROJECT, "Lista Team", BOARD, AUTH);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/Lista%20Team/");
  });
});

describe("updateBoardPosition", () => {
  const ORG = "https://dev.azure.com/myorg";
  const PROJECT = "MyProject";
  const AUTH = "Basic dGVzdA==";
  const BOARD_FIELDS = {
    columnField: "WEF_ABC_Kanban.Column",
    rowField: "WEF_ABC_Kanban.Lane",
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends PATCH with both column and lane fields", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await updateBoardPosition(ORG, PROJECT, 100, BOARD_FIELDS, { column: "Input Q", lane: "UI Prototype" }, AUTH);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://dev.azure.com/myorg/MyProject/_apis/wit/workitems/100?api-version=7.0");
    expect(opts.method).toBe("PATCH");
    expect(opts.headers["Content-Type"]).toBe("application/json-patch+json");

    const body = JSON.parse(opts.body);
    expect(body).toHaveLength(2);
    expect(body[0]).toEqual({ op: "add", path: "/fields/WEF_ABC_Kanban.Column", value: "Input Q" });
    expect(body[1]).toEqual({ op: "add", path: "/fields/WEF_ABC_Kanban.Lane", value: "UI Prototype" });
  });

  it("sends only column when lane is not specified", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await updateBoardPosition(ORG, PROJECT, 100, BOARD_FIELDS, { column: "Active" }, AUTH);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toHaveLength(1);
    expect(body[0].path).toBe("/fields/WEF_ABC_Kanban.Column");
  });

  it("sends only lane when column is not specified", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await updateBoardPosition(ORG, PROJECT, 100, BOARD_FIELDS, { lane: "Expedite" }, AUTH);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toHaveLength(1);
    expect(body[0].path).toBe("/fields/WEF_ABC_Kanban.Lane");
  });

  it("does nothing when placement is empty", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    await updateBoardPosition(ORG, PROJECT, 100, BOARD_FIELDS, {}, AUTH);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("does nothing when board fields are null", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    await updateBoardPosition(ORG, PROJECT, 100, { columnField: null, rowField: null }, { column: "Input Q", lane: "UI Prototype" }, AUTH);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve("TF401326: Invalid field"),
    }));

    await expect(
      updateBoardPosition(ORG, PROJECT, 100, BOARD_FIELDS, { column: "Bad Column" }, AUTH)
    ).rejects.toThrow("Board position update 400: TF401326: Invalid field");
  });
});
