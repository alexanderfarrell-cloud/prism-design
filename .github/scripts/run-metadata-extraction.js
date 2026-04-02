/**
 * Orchestrate Copilot-based metadata extraction with validation and retry.
 *
 * For each slug in the prompts array, invokes Copilot CLI, validates output
 * against the Zod schema, and retries with error feedback on failure.
 *
 * The copilot invocation is injectable for testability.
 *
 * Usage:
 *   node .github/scripts/run-metadata-extraction.js '<prompts-json>'
 *   echo '<prompts-json>' | node .github/scripts/run-metadata-extraction.js
 *
 * Environment:
 *   METADATA_MAX_RETRIES  - Max retry attempts per slug (default: 2)
 *   METADATA_OUTPUT_DIR   - Output directory for .json files (default: metadata)
 *
 * Exit codes:
 *   0 - all slugs succeeded or were gracefully skipped
 *   1 - invalid input
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { processAgentOutput, buildRetryPrompt } from "./validate-metadata.js";

/**
 * Invoke Copilot CLI with a prompt and return raw stdout.
 * Throws on non-zero exit.
 */
export function invokeCopilot(prompt) {
  const escaped = prompt.replace(/'/g, "'\\''");
  return execSync(`copilot --deny-tool='write' --deny-tool='shell' -p '${escaped}' -s --no-ask-user`, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });
}

/**
 * Extract and validate metadata for a single slug, with retry logic.
 *
 * @param {string} slug
 * @param {string} prompt - Original extraction prompt
 * @param {object} options
 * @param {number} [options.maxRetries=2]
 * @param {string} [options.outputDir="metadata"]
 * @param {(prompt: string) => string} [options.copilotFn] - Injectable copilot invoker
 * @returns {{ slug: string, ok: boolean, attempt: number, error?: string }}
 */
export function extractMetadataForSlug(slug, prompt, options = {}) {
  const {
    maxRetries = 2,
    outputDir = "metadata",
    copilotFn = invokeCopilot,
  } = options;

  let lastError = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const currentPrompt =
      attempt === 0 ? prompt : buildRetryPrompt(prompt, lastError);

    if (attempt > 0) {
      console.log(`Retry ${attempt}/${maxRetries} for ${slug}`);
    }

    let raw;
    try {
      raw = copilotFn(currentPrompt);
    } catch (err) {
      console.warn(
        `WARNING: Copilot invocation failed for ${slug} (attempt ${attempt}): ${err.message}`
      );
      lastError = `Copilot invocation failed: ${err.message}`;
      continue;
    }

    const result = processAgentOutput(raw);

    if (result.ok) {
      const outPath = path.join(outputDir, `${slug}.json`);
      fs.writeFileSync(outPath, JSON.stringify(result.data, null, 2));
      console.log(`Valid metadata extracted for ${slug} (attempt ${attempt})`);
      return { slug, ok: true, attempt };
    }

    lastError = result.error;
    console.warn(
      `Validation failed for ${slug} (attempt ${attempt}): ${result.error}`
    );
  }

  console.warn(
    `WARNING: All ${maxRetries + 1} attempts failed for ${slug}, skipping`
  );
  return { slug, ok: false, attempt: maxRetries, error: lastError };
}

/**
 * Run metadata extraction for all slugs in the prompts array.
 *
 * @param {Array<{slug: string, prompt: string}>} prompts
 * @param {object} options - Passed through to extractMetadataForSlug
 * @returns {{ results: Array, succeeded: number, skipped: number }}
 */
export function runMetadataExtraction(prompts, options = {}) {
  if (!Array.isArray(prompts) || prompts.length === 0) {
    return { results: [], succeeded: 0, skipped: 0 };
  }

  const outputDir = options.outputDir || "metadata";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];
  let succeeded = 0;
  let skipped = 0;

  for (const entry of prompts) {
    if (!entry || typeof entry.slug !== "string" || typeof entry.prompt !== "string") {
      console.warn("WARNING: Skipping invalid prompt entry");
      skipped++;
      continue;
    }

    const result = extractMetadataForSlug(entry.slug, entry.prompt, {
      ...options,
      outputDir,
    });

    results.push(result);
    if (result.ok) {
      succeeded++;
    } else {
      skipped++;
    }
  }

  if (skipped > 0) {
    console.warn(
      `WARNING: ${skipped} metadata extraction(s) failed validation after retries.`
    );
  }

  console.log(
    `Metadata extraction complete: ${succeeded} succeeded, ${skipped} skipped`
  );

  return { results, succeeded, skipped };
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  (async () => {
    let inputJson = process.argv[2];

    if (!inputJson) {
      const chunks = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      inputJson = Buffer.concat(chunks).toString().trim();
    }

    if (!inputJson) {
      console.error(
        "Usage: node .github/scripts/run-metadata-extraction.js '<prompts-json>'"
      );
      process.exit(1);
    }

    let prompts;
    try {
      prompts = JSON.parse(inputJson);
    } catch {
      console.error("Invalid JSON input");
      process.exit(1);
    }

    const maxRetries = parseInt(process.env.METADATA_MAX_RETRIES || "2", 10);
    const outputDir = process.env.METADATA_OUTPUT_DIR || "metadata";

    runMetadataExtraction(prompts, { maxRetries, outputDir });
  })();
}
