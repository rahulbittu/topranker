/**
 * Sprint 811: Shared config assertion helpers.
 *
 * Reduces test fragility by centralizing config-related assertions.
 * When config.ts patterns change, only this file needs updating
 * instead of 17+ individual test files.
 */
import * as fs from "fs";
import * as path from "path";
import { expect } from "vitest";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

/** Assert a server file imports config and has no direct process.env access */
export function assertUsesConfig(
  filePath: string,
  options?: {
    /** Config properties the file should reference */
    expectProperties?: string[];
    /** process.env vars that should NOT appear */
    forbidEnvVars?: string[];
  },
) {
  const src = readFile(filePath);
  const fileName = path.basename(filePath);

  // Must import config
  expect(src, `${fileName} should import config`).toContain(
    'import { config } from "./config"',
  );

  // Must not have direct process.env (excluding comments)
  const lines = src.split("\n");
  const codeLines = lines.filter(
    (l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"),
  );
  const codeSrc = codeLines.join("\n");
  expect(codeSrc, `${fileName} should not access process.env directly`).not.toMatch(
    /process\.env\./,
  );

  // Check specific config properties
  if (options?.expectProperties) {
    for (const prop of options.expectProperties) {
      expect(src, `${fileName} should use config.${prop}`).toContain(
        `config.${prop}`,
      );
    }
  }

  // Check forbidden env vars
  if (options?.forbidEnvVars) {
    for (const envVar of options.forbidEnvVars) {
      expect(src, `${fileName} should not reference ${envVar}`).not.toContain(
        envVar,
      );
    }
  }
}

/**
 * Assert bootstrap file has direct process.env access (permanent pre-config boundary).
 * Bootstrap files MAY also import config for non-bootstrap config values,
 * but they MUST retain direct process.env access for initialization-critical vars
 * (DATABASE_URL, PORT, NODE_ENV) that must be available before config validates.
 */
export function assertBootstrapExempt(filePath: string) {
  const src = readFile(filePath);
  const fileName = path.basename(filePath);

  // Should have direct process.env access (that's the point of exemption)
  expect(
    src,
    `${fileName} should access process.env directly (bootstrap boundary)`,
  ).toContain("process.env");
}

/** Assert config.ts has expected field count within guardrails */
export function assertConfigGuardrails() {
  const configSrc = readFile("server/config.ts");
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  // Count fields by matching property assignments in the config object
  const fieldMatches = configSrc.match(/^\s+\w+:/gm) || [];
  // Subtract comment-only lines and the 'as const' line
  const fieldCount = fieldMatches.filter(
    (m) => !m.trim().startsWith("//"),
  ).length;

  const maxFields = thresholds.config?.maxFields || 35;
  expect(
    fieldCount,
    `config.ts has ${fieldCount} fields, max is ${maxFields}`,
  ).toBeLessThanOrEqual(maxFields);
}
