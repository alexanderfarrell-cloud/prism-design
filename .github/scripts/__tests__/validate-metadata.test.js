import { describe, it, expect } from "vitest";
import {
  sanitizeAgentOutput,
  parseAgentOutput,
  validateMetadata,
  processAgentOutput,
  buildRetryPrompt,
  MetadataSchema,
} from "../validate-metadata.js";

const VALID_METADATA = {
  name: "Dashboard",
  slug: "dashboard-page",
  components: [
    {
      name: "ModusNavbar",
      props: { variant: "primary" },
      children: [{ name: "NavItem", props: { label: "Home" }, children: [] }],
    },
  ],
  interactiveElements: [
    { type: "button", label: "Save", position: "top-right" },
    { type: "input", label: "Search", position: "header" },
  ],
};

const VALID_JSON_STRING = JSON.stringify(VALID_METADATA);

describe("sanitizeAgentOutput", () => {
  it("returns empty string for non-string input", () => {
    expect(sanitizeAgentOutput(null)).toBe("");
    expect(sanitizeAgentOutput(undefined)).toBe("");
    expect(sanitizeAgentOutput(123)).toBe("");
  });

  it("returns trimmed string for bare JSON", () => {
    const result = sanitizeAgentOutput(`  ${VALID_JSON_STRING}  `);
    expect(result).toBe(VALID_JSON_STRING);
  });

  it("strips ```json fences", () => {
    const wrapped = "```json\n" + VALID_JSON_STRING + "\n```";
    const result = sanitizeAgentOutput(wrapped);
    expect(result).toBe(VALID_JSON_STRING);
  });

  it("strips ``` fences without language tag", () => {
    const wrapped = "```\n" + VALID_JSON_STRING + "\n```";
    const result = sanitizeAgentOutput(wrapped);
    expect(result).toBe(VALID_JSON_STRING);
  });

  it("strips surrounding prose before and after fences", () => {
    const wrapped =
      "Here is the metadata:\n\n```json\n" +
      VALID_JSON_STRING +
      "\n```\n\nI hope this helps!";
    const result = sanitizeAgentOutput(wrapped);
    expect(result).toBe(VALID_JSON_STRING);
  });

  it("extracts JSON from prose without fences", () => {
    const wrapped = "Here is the result:\n" + VALID_JSON_STRING + "\nDone.";
    const result = sanitizeAgentOutput(wrapped);
    expect(JSON.parse(result)).toEqual(VALID_METADATA);
  });

  it("handles empty string", () => {
    expect(sanitizeAgentOutput("")).toBe("");
  });

  it("handles whitespace-only string", () => {
    expect(sanitizeAgentOutput("   \n\t  ")).toBe("");
  });

  it("handles nested braces in JSON", () => {
    const nested = JSON.stringify({
      name: "Test",
      slug: "test",
      components: [
        { name: "A", props: { config: { nested: true } }, children: [] },
      ],
      interactiveElements: [],
    });
    const wrapped = "```json\n" + nested + "\n```";
    expect(JSON.parse(sanitizeAgentOutput(wrapped))).toEqual(JSON.parse(nested));
  });
});

describe("parseAgentOutput", () => {
  it("parses valid JSON", () => {
    const result = parseAgentOutput(VALID_JSON_STRING);
    expect(result.ok).toBe(true);
    expect(result.data).toEqual(VALID_METADATA);
  });

  it("parses JSON wrapped in markdown fences", () => {
    const wrapped = "```json\n" + VALID_JSON_STRING + "\n```";
    const result = parseAgentOutput(wrapped);
    expect(result.ok).toBe(true);
    expect(result.data).toEqual(VALID_METADATA);
  });

  it("returns error for empty input", () => {
    const result = parseAgentOutput("");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Empty output");
  });

  it("returns error for non-JSON content", () => {
    const result = parseAgentOutput("This is just plain text with no JSON.");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("JSON parse error");
  });

  it("returns error for truncated JSON", () => {
    const truncated = '{"name": "Dashboard", "slug": "test", "components": [';
    const result = parseAgentOutput(truncated);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("JSON parse error");
  });

  it("handles JSON with trailing comma (invalid JSON)", () => {
    const result = parseAgentOutput('{"name": "Dashboard",}');
    expect(result.ok).toBe(false);
    expect(result.error).toContain("JSON parse error");
  });
});

describe("validateMetadata", () => {
  it("accepts fully valid metadata", () => {
    const result = validateMetadata(VALID_METADATA);
    expect(result.ok).toBe(true);
    expect(result.data.name).toBe("Dashboard");
    expect(result.data.slug).toBe("dashboard-page");
    expect(result.data.components).toHaveLength(1);
    expect(result.data.interactiveElements).toHaveLength(2);
  });

  it("defaults optional fields when omitted", () => {
    const minimal = {
      name: "Dashboard",
      slug: "dashboard-page",
      components: [{ name: "ModusNavbar" }],
      interactiveElements: [],
    };
    const result = validateMetadata(minimal);
    expect(result.ok).toBe(true);
    expect(result.data.components[0].props).toEqual({});
    expect(result.data.components[0].children).toEqual([]);
  });

  it("defaults interactiveElements to empty array when missing", () => {
    const noElements = {
      name: "Dashboard",
      slug: "dashboard-page",
      components: [{ name: "ModusNavbar" }],
    };
    const result = validateMetadata(noElements);
    expect(result.ok).toBe(true);
    expect(result.data.interactiveElements).toEqual([]);
  });

  it("rejects missing name", () => {
    const invalid = { ...VALID_METADATA, name: undefined };
    const result = validateMetadata(invalid);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("name");
  });

  it("rejects empty name", () => {
    const invalid = { ...VALID_METADATA, name: "" };
    const result = validateMetadata(invalid);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("name");
  });

  it("rejects missing slug", () => {
    const invalid = { ...VALID_METADATA, slug: undefined };
    const result = validateMetadata(invalid);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("slug");
  });

  it("rejects empty components array", () => {
    const invalid = { ...VALID_METADATA, components: [] };
    const result = validateMetadata(invalid);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("components");
  });

  it("rejects missing components", () => {
    const invalid = { name: "Test", slug: "test" };
    const result = validateMetadata(invalid);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("components");
  });

  it("rejects component with empty name", () => {
    const invalid = {
      ...VALID_METADATA,
      components: [{ name: "" }],
    };
    const result = validateMetadata(invalid);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("name");
  });

  it("rejects interactive element with missing type", () => {
    const invalid = {
      ...VALID_METADATA,
      interactiveElements: [{ label: "Save", position: "top" }],
    };
    const result = validateMetadata(invalid);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("type");
  });

  it("rejects interactive element with missing label", () => {
    const invalid = {
      ...VALID_METADATA,
      interactiveElements: [{ type: "button", position: "top" }],
    };
    const result = validateMetadata(invalid);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("label");
  });

  it("validates deeply nested components", () => {
    const deep = {
      name: "Complex",
      slug: "complex-page",
      components: [
        {
          name: "Root",
          children: [
            {
              name: "Level1",
              children: [
                {
                  name: "Level2",
                  children: [{ name: "Level3" }],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = validateMetadata(deep);
    expect(result.ok).toBe(true);
    expect(result.data.components[0].children[0].children[0].children[0].name).toBe(
      "Level3"
    );
  });

  it("provides clear error paths for nested validation failures", () => {
    const invalid = {
      name: "Test",
      slug: "test",
      components: [
        {
          name: "Root",
          children: [{ name: "" }],
        },
      ],
    };
    const result = validateMetadata(invalid);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("children");
    expect(result.error).toContain("name");
  });
});

describe("processAgentOutput (end-to-end)", () => {
  it("handles valid bare JSON", () => {
    const result = processAgentOutput(VALID_JSON_STRING);
    expect(result.ok).toBe(true);
    expect(result.data.name).toBe("Dashboard");
  });

  it("handles valid JSON in markdown fences", () => {
    const wrapped = "```json\n" + VALID_JSON_STRING + "\n```";
    const result = processAgentOutput(wrapped);
    expect(result.ok).toBe(true);
    expect(result.data.slug).toBe("dashboard-page");
  });

  it("handles valid JSON with surrounding prose", () => {
    const wrapped =
      "Sure! Here is the metadata:\n\n" + VALID_JSON_STRING + "\n\nLet me know if you need changes.";
    const result = processAgentOutput(wrapped);
    expect(result.ok).toBe(true);
  });

  it("rejects empty input", () => {
    const result = processAgentOutput("");
    expect(result.ok).toBe(false);
  });

  it("rejects valid JSON that fails schema", () => {
    const badSchema = JSON.stringify({ name: "Test" });
    const result = processAgentOutput(badSchema);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Schema validation");
  });

  it("rejects malformed JSON even inside fences", () => {
    const broken = '```json\n{"name": "Test", invalid}\n```';
    const result = processAgentOutput(broken);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("JSON parse error");
  });

  it("handles agent output with only prose (no JSON)", () => {
    const prose =
      "I was unable to extract metadata. The source files appear to be empty.";
    const result = processAgentOutput(prose);
    expect(result.ok).toBe(false);
  });

  it("defaults optional fields in end-to-end pipeline", () => {
    const minimal = JSON.stringify({
      name: "Simple",
      slug: "simple",
      components: [{ name: "Root" }],
    });
    const result = processAgentOutput(minimal);
    expect(result.ok).toBe(true);
    expect(result.data.interactiveElements).toEqual([]);
    expect(result.data.components[0].props).toEqual({});
    expect(result.data.components[0].children).toEqual([]);
  });
});

describe("edge cases", () => {
  it("recovers JSON object from array wrapper at root level", () => {
    const arrayOutput = JSON.stringify([VALID_METADATA]);
    const result = processAgentOutput(arrayOutput);
    expect(result.ok).toBe(true);
    expect(result.data.name).toBe("Dashboard");
  });

  it("handles unicode characters in component names", () => {
    const unicode = JSON.stringify({
      name: "Ubersicht",
      slug: "ubersicht-page",
      components: [{ name: "ModusCard" }],
      interactiveElements: [{ type: "button", label: "Speichern", position: "unten" }],
    });
    const result = processAgentOutput(unicode);
    expect(result.ok).toBe(true);
    expect(result.data.name).toBe("Ubersicht");
  });

  it("extracts JSON from output with multiple fence blocks (uses first)", () => {
    const multi =
      "```json\n" +
      VALID_JSON_STRING +
      '\n```\n\nHere is another block:\n```json\n{"name":"Other"}\n```';
    const result = sanitizeAgentOutput(multi);
    expect(JSON.parse(result)).toEqual(VALID_METADATA);
  });
});

describe("buildRetryPrompt", () => {
  it("includes validation error in retry prompt", () => {
    const prompt = buildRetryPrompt(
      "Extract metadata...",
      "Schema validation failed:\n  - name: Required"
    );
    expect(prompt).toContain("Schema validation failed");
    expect(prompt).toContain("name: Required");
  });

  it("includes original prompt", () => {
    const original = "Read the following source files and extract metadata.";
    const prompt = buildRetryPrompt(original, "Some error");
    expect(prompt).toContain(original);
  });

  it("instructs agent to fix output", () => {
    const prompt = buildRetryPrompt("Extract...", "error");
    expect(prompt).toContain("Fix the following errors");
    expect(prompt).toContain("ONLY valid JSON");
  });
});

describe("MetadataSchema export", () => {
  it("is a Zod schema that can be used externally", () => {
    const result = MetadataSchema.safeParse(VALID_METADATA);
    expect(result.success).toBe(true);
  });
});
