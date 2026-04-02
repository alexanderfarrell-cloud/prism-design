import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import {
  extractMetadataForSlug,
  runMetadataExtraction,
} from "../run-metadata-extraction.js";

const VALID_METADATA = {
  name: "Dashboard",
  slug: "dashboard-page",
  components: [
    { name: "ModusNavbar", props: { variant: "primary" }, children: [] },
  ],
  interactiveElements: [
    { type: "button", label: "Save", position: "top-right" },
  ],
};

const VALID_JSON = JSON.stringify(VALID_METADATA);

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "run-metadata-"));
}

describe("extractMetadataForSlug", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("writes validated JSON on first attempt when copilot returns valid output", () => {
    const copilotFn = vi.fn().mockReturnValue(VALID_JSON);

    const result = extractMetadataForSlug("dashboard-page", "extract...", {
      outputDir: tmpDir,
      copilotFn,
    });

    expect(result.ok).toBe(true);
    expect(result.slug).toBe("dashboard-page");
    expect(result.attempt).toBe(0);
    expect(copilotFn).toHaveBeenCalledTimes(1);

    const written = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "dashboard-page.json"), "utf-8")
    );
    expect(written.name).toBe("Dashboard");
    expect(written.slug).toBe("dashboard-page");
  });

  it("handles copilot output wrapped in markdown fences", () => {
    const copilotFn = vi
      .fn()
      .mockReturnValue("```json\n" + VALID_JSON + "\n```");

    const result = extractMetadataForSlug("dashboard-page", "extract...", {
      outputDir: tmpDir,
      copilotFn,
    });

    expect(result.ok).toBe(true);
    expect(copilotFn).toHaveBeenCalledTimes(1);
  });

  it("retries on invalid output and succeeds on second attempt", () => {
    const copilotFn = vi
      .fn()
      .mockReturnValueOnce('{"invalid": true}')
      .mockReturnValueOnce(VALID_JSON);

    const result = extractMetadataForSlug("dashboard-page", "extract...", {
      outputDir: tmpDir,
      maxRetries: 2,
      copilotFn,
    });

    expect(result.ok).toBe(true);
    expect(result.attempt).toBe(1);
    expect(copilotFn).toHaveBeenCalledTimes(2);

    const retryPrompt = copilotFn.mock.calls[1][0];
    expect(retryPrompt).toContain("previous output was invalid");
    expect(retryPrompt).toContain("Schema validation failed");
  });

  it("retries on copilot invocation failure and succeeds on retry", () => {
    const copilotFn = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("Network timeout");
      })
      .mockReturnValueOnce(VALID_JSON);

    const result = extractMetadataForSlug("dashboard-page", "extract...", {
      outputDir: tmpDir,
      maxRetries: 2,
      copilotFn,
    });

    expect(result.ok).toBe(true);
    expect(result.attempt).toBe(1);
    expect(copilotFn).toHaveBeenCalledTimes(2);
  });

  it("fails after exhausting all retries", () => {
    const copilotFn = vi.fn().mockReturnValue("not json at all");

    const result = extractMetadataForSlug("dashboard-page", "extract...", {
      outputDir: tmpDir,
      maxRetries: 1,
      copilotFn,
    });

    expect(result.ok).toBe(false);
    expect(result.slug).toBe("dashboard-page");
    expect(result.error).toBeTruthy();
    expect(copilotFn).toHaveBeenCalledTimes(2);

    expect(fs.existsSync(path.join(tmpDir, "dashboard-page.json"))).toBe(
      false
    );
  });

  it("fails when copilot always throws", () => {
    const copilotFn = vi.fn().mockImplementation(() => {
      throw new Error("Service unavailable");
    });

    const result = extractMetadataForSlug("dashboard-page", "extract...", {
      outputDir: tmpDir,
      maxRetries: 1,
      copilotFn,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Copilot invocation failed");
    expect(copilotFn).toHaveBeenCalledTimes(2);
  });

  it("passes original prompt on first attempt, retry prompt on subsequent", () => {
    const copilotFn = vi
      .fn()
      .mockReturnValueOnce("bad output")
      .mockReturnValueOnce("still bad")
      .mockReturnValueOnce(VALID_JSON);

    const originalPrompt = "Read these files and extract metadata.";

    extractMetadataForSlug("test-page", originalPrompt, {
      outputDir: tmpDir,
      maxRetries: 2,
      copilotFn,
    });

    expect(copilotFn.mock.calls[0][0]).toBe(originalPrompt);
    expect(copilotFn.mock.calls[1][0]).toContain("previous output was invalid");
    expect(copilotFn.mock.calls[1][0]).toContain(originalPrompt);
    expect(copilotFn.mock.calls[2][0]).toContain("previous output was invalid");
  });

  it("uses maxRetries=0 for single attempt (no retries)", () => {
    const copilotFn = vi.fn().mockReturnValue("bad output");

    const result = extractMetadataForSlug("test-page", "prompt", {
      outputDir: tmpDir,
      maxRetries: 0,
      copilotFn,
    });

    expect(result.ok).toBe(false);
    expect(copilotFn).toHaveBeenCalledTimes(1);
  });

  it("defaults optional fields in validated output", () => {
    const minimal = JSON.stringify({
      name: "Simple",
      slug: "simple",
      components: [{ name: "Root" }],
    });
    const copilotFn = vi.fn().mockReturnValue(minimal);

    extractMetadataForSlug("simple", "extract...", {
      outputDir: tmpDir,
      copilotFn,
    });

    const written = JSON.parse(
      fs.readFileSync(path.join(tmpDir, "simple.json"), "utf-8")
    );
    expect(written.interactiveElements).toEqual([]);
    expect(written.components[0].props).toEqual({});
    expect(written.components[0].children).toEqual([]);
  });
});

describe("runMetadataExtraction", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty results for empty prompts array", () => {
    const result = runMetadataExtraction([], { outputDir: tmpDir });
    expect(result.results).toEqual([]);
    expect(result.succeeded).toBe(0);
    expect(result.skipped).toBe(0);
  });

  it("returns empty results for non-array input", () => {
    const result = runMetadataExtraction(null, { outputDir: tmpDir });
    expect(result.results).toEqual([]);
  });

  it("processes multiple slugs independently", () => {
    const copilotFn = vi.fn().mockReturnValue(VALID_JSON);

    const prompts = [
      { slug: "page-a", prompt: "extract a" },
      { slug: "page-b", prompt: "extract b" },
    ];

    const result = runMetadataExtraction(prompts, {
      outputDir: tmpDir,
      copilotFn,
    });

    expect(result.succeeded).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.results).toHaveLength(2);
    expect(copilotFn).toHaveBeenCalledTimes(2);
  });

  it("counts successes and failures separately", () => {
    const copilotFn = vi
      .fn()
      .mockReturnValueOnce(VALID_JSON)
      .mockReturnValue("not json");

    const prompts = [
      { slug: "good-page", prompt: "extract good" },
      { slug: "bad-page", prompt: "extract bad" },
    ];

    const result = runMetadataExtraction(prompts, {
      outputDir: tmpDir,
      maxRetries: 0,
      copilotFn,
    });

    expect(result.succeeded).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.results[0].ok).toBe(true);
    expect(result.results[1].ok).toBe(false);
  });

  it("skips invalid prompt entries", () => {
    const copilotFn = vi.fn().mockReturnValue(VALID_JSON);

    const prompts = [
      null,
      { slug: 123, prompt: "bad slug type" },
      { slug: "valid-page", prompt: "extract..." },
    ];

    const result = runMetadataExtraction(prompts, {
      outputDir: tmpDir,
      copilotFn,
    });

    expect(result.succeeded).toBe(1);
    expect(result.skipped).toBe(2);
    expect(copilotFn).toHaveBeenCalledTimes(1);
  });

  it("creates output directory if it does not exist", () => {
    const nestedDir = path.join(tmpDir, "nested", "output");
    const copilotFn = vi.fn().mockReturnValue(VALID_JSON);

    runMetadataExtraction([{ slug: "test", prompt: "p" }], {
      outputDir: nestedDir,
      copilotFn,
    });

    expect(fs.existsSync(nestedDir)).toBe(true);
    expect(
      fs.existsSync(path.join(nestedDir, "test.json"))
    ).toBe(true);
  });

  it("passes maxRetries option through to per-slug extraction", () => {
    const copilotFn = vi.fn().mockReturnValue("bad");

    runMetadataExtraction([{ slug: "test", prompt: "p" }], {
      outputDir: tmpDir,
      maxRetries: 3,
      copilotFn,
    });

    expect(copilotFn).toHaveBeenCalledTimes(4);
  });

  it("writes only successful slugs to disk", () => {
    const copilotFn = vi
      .fn()
      .mockReturnValueOnce(VALID_JSON)
      .mockReturnValue("bad");

    const prompts = [
      { slug: "good", prompt: "p1" },
      { slug: "bad", prompt: "p2" },
    ];

    runMetadataExtraction(prompts, {
      outputDir: tmpDir,
      maxRetries: 0,
      copilotFn,
    });

    expect(fs.existsSync(path.join(tmpDir, "good.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "bad.json"))).toBe(false);
  });
});
