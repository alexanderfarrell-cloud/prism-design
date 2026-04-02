import { describe, it, expect } from "vitest";
import { buildPrompt, buildRoutesList, generatePrompts, loadPromptTemplate } from "../capture-screenshots.js";

const template = loadPromptTemplate();

describe("loadPromptTemplate", () => {
  it("loads the template and strips YAML frontmatter", () => {
    expect(template).not.toMatch(/^---/);
    expect(template).toContain("{{ROUTES_LIST}}");
    expect(template).toContain("{{SLUG}}");
  });

  it("references Playwright MCP browser tools", () => {
    expect(template).toContain("browser_navigate");
    expect(template).toContain("browser_take_screenshot");
    expect(template).toContain("browser_resize");
  });
});

describe("buildRoutesList", () => {
  it("formats a single route with URL", () => {
    const list = buildRoutesList(["/dashboard"], "http://localhost:5173");
    expect(list).toBe("- /dashboard -> http://localhost:5173/dashboard");
  });

  it("formats multiple routes", () => {
    const list = buildRoutesList(
      ["/employees", "/employees/new"],
      "http://localhost:5173"
    );
    expect(list).toContain("- /employees -> http://localhost:5173/employees");
    expect(list).toContain("- /employees/new -> http://localhost:5173/employees/new");
  });

  it("annotates routes with dynamic parameters", () => {
    const list = buildRoutesList(["/employees/:id"], "http://localhost:5173");
    expect(list).toContain(":id");
    expect(list).toContain("dynamic parameters");
  });

  it("does not annotate static routes", () => {
    const list = buildRoutesList(["/employees"], "http://localhost:5173");
    expect(list).not.toContain("dynamic parameters");
  });
});

describe("buildPrompt", () => {
  it("includes routes list, viewport, and filename", () => {
    const prompt = buildPrompt(
      "dashboard-page",
      ["/dashboard"],
      "http://localhost:5173",
      template
    );
    expect(prompt).toContain("http://localhost:5173/dashboard");
    expect(prompt).toContain("1440x900");
    expect(prompt).toContain("screenshots/dashboard-page.png");
  });

  it("includes multiple routes in the prompt", () => {
    const prompt = buildPrompt(
      "employees",
      ["/employees", "/employees/new", "/employees/:id"],
      "http://localhost:5173",
      template
    );
    expect(prompt).toContain("http://localhost:5173/employees");
    expect(prompt).toContain("http://localhost:5173/employees/new");
    expect(prompt).toContain("/employees/:id");
    expect(prompt).toContain("dynamic parameters");
  });

  it("includes multi-step instructions for wizard flows", () => {
    const prompt = buildPrompt(
      "payroll-onboarding",
      ["/payroll/setup"],
      "http://localhost:5173",
      template
    );
    expect(prompt).toContain("Next/Continue");
    expect(prompt).toContain("wizard step tabs");
    expect(prompt).toContain("click through each step");
  });

  it("includes 404 handling instructions", () => {
    const prompt = buildPrompt(
      "foo-page",
      ["/foo"],
      "http://localhost:5173",
      template
    );
    expect(prompt).toContain("404");
    expect(prompt).toContain("skip");
  });

  it("uses custom base URL when provided", () => {
    const prompt = buildPrompt(
      "test-page",
      ["/test"],
      "http://localhost:3000",
      template
    );
    expect(prompt).toContain("http://localhost:3000/test");
  });

  it("handles legacy string route input", () => {
    const prompt = buildPrompt(
      "home-page",
      "/",
      "http://localhost:5173",
      template
    );
    expect(prompt).toContain("http://localhost:5173/");
    expect(prompt).toContain("screenshots/home-page.png");
  });

  it("references Playwright MCP tools", () => {
    const prompt = buildPrompt(
      "test-page",
      ["/test"],
      "http://localhost:5173",
      template
    );
    expect(prompt).toContain("browser_navigate");
    expect(prompt).toContain("browser_take_screenshot");
  });
});

describe("generatePrompts", () => {
  it("generates one prompt per slug with all routes", () => {
    const routes = {
      "dashboard-page": ["/dashboard"],
      "payroll-onboarding": ["/payroll/setup"],
    };
    const prompts = generatePrompts(routes);
    expect(prompts).toHaveLength(2);
    expect(prompts[0]).toEqual({
      slug: "dashboard-page",
      routes: ["/dashboard"],
      prompt: expect.stringContaining("http://localhost:5173/dashboard"),
    });
    expect(prompts[1]).toEqual({
      slug: "payroll-onboarding",
      routes: ["/payroll/setup"],
      prompt: expect.stringContaining("http://localhost:5173/payroll/setup"),
    });
  });

  it("includes all routes for a multi-route slug", () => {
    const routes = {
      employees: ["/employees", "/employees/new", "/employees/:id"],
    };
    const prompts = generatePrompts(routes);
    expect(prompts).toHaveLength(1);
    expect(prompts[0].routes).toEqual([
      "/employees",
      "/employees/new",
      "/employees/:id",
    ]);
    expect(prompts[0].prompt).toContain("http://localhost:5173/employees");
    expect(prompts[0].prompt).toContain("http://localhost:5173/employees/new");
  });

  it("uses default base URL when not provided", () => {
    const routes = { test: ["/test"] };
    const prompts = generatePrompts(routes);
    expect(prompts[0].prompt).toContain("http://localhost:5173/test");
  });

  it("uses custom base URL when provided", () => {
    const routes = { test: ["/test"] };
    const prompts = generatePrompts(routes, "http://localhost:8080");
    expect(prompts[0].prompt).toContain("http://localhost:8080/test");
  });

  it("returns empty array for empty input", () => {
    expect(generatePrompts({})).toEqual([]);
  });

  it("returns empty array for null/undefined routes", () => {
    expect(generatePrompts(null)).toEqual([]);
    expect(generatePrompts(undefined)).toEqual([]);
  });

  it("returns empty array for non-object routes", () => {
    expect(generatePrompts("invalid")).toEqual([]);
    expect(generatePrompts(123)).toEqual([]);
    expect(generatePrompts([])).toEqual([]);
  });

  it("skips entries with non-string routes in array", () => {
    const routes = {
      valid: ["/valid"],
      "invalid-route": [123, null],
    };
    const prompts = generatePrompts(routes);
    expect(prompts).toHaveLength(1);
    expect(prompts[0].slug).toBe("valid");
  });

  it("handles legacy string route values", () => {
    const routes = { "my-page": "/my/route" };
    const prompts = generatePrompts(routes);
    expect(prompts).toHaveLength(1);
    expect(prompts[0].routes).toEqual(["/my/route"]);
    expect(prompts[0].prompt).toContain("http://localhost:5173/my/route");
  });
});
