/**
 * Sprint 596: Shared test helper for reading source files.
 * Reduces duplication of readFile/countLines/fileExists across 162 test files.
 * New tests should import from here instead of defining their own readFile.
 */
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");

/** Read a source file relative to project root */
export function readFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

/** Count lines in a source file */
export function countLines(relPath: string): number {
  return readFile(relPath).split("\n").length;
}

/** Check if a file exists relative to project root */
export function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

/** Get file size in bytes */
export function fileSize(relPath: string): number {
  return Buffer.byteLength(readFile(relPath), "utf-8");
}

/** Read and parse JSON file */
export function readJson<T = unknown>(relPath: string): T {
  return JSON.parse(readFile(relPath)) as T;
}

/** Get thresholds.json config */
export function getThresholds() {
  return readJson<{
    files: Record<string, { maxLOC: number; current: number; notes: string }>;
    build: { maxSizeKb: number; currentSizeKb: number };
    tests: { minCount: number; currentCount: number };
  }>("shared/thresholds.json");
}
