/**
 * Validate and sanitize Copilot agent metadata output.
 *
 * The Copilot agent is prompted to return JSON matching a specific schema,
 * but may output markdown fences, extra prose, or malformed JSON. This module:
 *   1. Strips markdown code fences and surrounding prose
 *   2. Parses the result as JSON
 *   3. Validates against a Zod schema
 *   4. Returns a clean, validated object or a structured error
 *
 * Usage (CLI):
 *   node .github/scripts/validate-metadata.js <file.json>
 *   cat raw-output.txt | node .github/scripts/validate-metadata.js
 *
 * Exit codes:
 *   0 - valid, writes sanitized JSON to stdout
 *   1 - invalid, writes error details to stderr
 */

import fs from "fs";
import { fileURLToPath } from "url";
import { z } from "zod";

const ComponentSchema = z.object({
  name: z.string().min(1),
  props: z.record(z.string(), z.unknown()).optional().default({}),
  get children() {
    return z.array(ComponentSchema).optional().default([]);
  },
});

const InteractiveElementSchema = z.object({
  type: z.string().min(1),
  label: z.string().min(1),
  position: z.string().optional().default(""),
});

export const MetadataSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  components: z.array(ComponentSchema).min(1),
  interactiveElements: z.array(InteractiveElementSchema).default([]),
});

/**
 * Strip markdown code fences and surrounding prose from agent output.
 * Handles ```json ... ```, ``` ... ```, and bare JSON.
 */
export function sanitizeAgentOutput(raw) {
  if (typeof raw !== "string") return "";

  let text = raw.trim();

  const fencePattern = /```(?:json)?\s*\n?([\s\S]*?)```/;
  const match = text.match(fencePattern);
  if (match) {
    text = match[1].trim();
  }

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    text = text.slice(jsonStart, jsonEnd + 1);
  }

  return text;
}

/**
 * Parse raw agent output into a JSON object.
 * Returns { ok: true, data } or { ok: false, error }.
 */
export function parseAgentOutput(raw) {
  const sanitized = sanitizeAgentOutput(raw);

  if (!sanitized) {
    return { ok: false, error: "Empty output after sanitization" };
  }

  try {
    const data = JSON.parse(sanitized);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: `JSON parse error: ${err.message}` };
  }
}

/**
 * Validate a parsed metadata object against the schema.
 * Returns { ok: true, data } with the validated/defaulted object,
 * or { ok: false, error } with a human-readable error string.
 */
export function validateMetadata(data) {
  const result = MetadataSchema.safeParse(data);

  if (result.success) {
    return { ok: true, data: result.data };
  }

  const issues = result.error.issues.map(
    (i) => `  - ${i.path.join(".")}: ${i.message}`
  );
  return {
    ok: false,
    error: `Schema validation failed:\n${issues.join("\n")}`,
  };
}

/**
 * Full pipeline: sanitize -> parse -> validate.
 * Returns { ok: true, data } or { ok: false, error }.
 */
export function processAgentOutput(raw) {
  const parsed = parseAgentOutput(raw);
  if (!parsed.ok) return parsed;
  return validateMetadata(parsed.data);
}

/**
 * Build a retry prompt that includes the original prompt and the validation error,
 * instructing the agent to correct its output.
 */
export function buildRetryPrompt(originalPrompt, validationError) {
  return [
    "Your previous output was invalid. Fix the following errors and output ONLY valid JSON (no markdown, no extra text).",
    "",
    "Errors:",
    validationError,
    "",
    "Original instructions:",
    originalPrompt,
  ].join("\n");
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  (async () => {
    let raw = "";

    if (process.argv[2]) {
      try {
        raw = fs.readFileSync(process.argv[2], "utf-8");
      } catch (err) {
        console.error(`Cannot read file: ${err.message}`);
        process.exit(1);
      }
    } else {
      const chunks = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      raw = Buffer.concat(chunks).toString();
    }

    const result = processAgentOutput(raw);

    if (result.ok) {
      console.log(JSON.stringify(result.data, null, 2));
      process.exit(0);
    } else {
      console.error(result.error);
      process.exit(1);
    }
  })();
}
