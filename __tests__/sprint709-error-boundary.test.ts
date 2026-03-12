/**
 * Sprint 709: Error boundary improvements — icon, copy, home fallback.
 * Validates improved fallback UI with brand icon, reassuring copy, and Go Home button.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Improved Error UI ──────────────────────────────────────────────────

describe("Sprint 709: Error boundary UI improvements", () => {
  const src = readFile("components/ErrorBoundary.tsx");

  it("uses Ionicons warning icon instead of emoji", () => {
    expect(src).toContain('name="warning-outline"');
    expect(src).not.toContain("⚠");
  });

  it("has amber-tinted icon circle", () => {
    expect(src).toContain("iconCircle");
    expect(src).toContain("BRAND.colors.amber");
  });

  it("has reassuring message copy", () => {
    expect(src).toContain("your data is safe");
    expect(src).toContain("Try again or head back to the home screen");
  });

  it("shows debug info in dev mode", () => {
    expect(src).toContain("__DEV__");
    expect(src).toContain("debugInfo");
  });

  it("has Go Home fallback button", () => {
    expect(src).toContain("Go Home");
    expect(src).toContain("homeBtn");
  });

  it("Go Home navigates to tabs", () => {
    expect(src).toContain('router.replace("/(tabs)")');
  });

  it("Go Home has try/catch for safety", () => {
    expect(src).toContain("try { require");
  });

  it("has sprint 709 comment", () => {
    expect(src).toContain("Sprint 709: Improved error boundary UI");
  });
});

// ─── Existing Error Boundary Features ───────────────────────────────────

describe("Sprint 709: Error boundary core preserved", () => {
  const src = readFile("components/ErrorBoundary.tsx");

  it("exports ErrorBoundary class component", () => {
    expect(src).toContain("export class ErrorBoundary");
  });

  it("has getDerivedStateFromError", () => {
    expect(src).toContain("getDerivedStateFromError");
  });

  it("has componentDidCatch with crash reporting", () => {
    expect(src).toContain("componentDidCatch");
    expect(src).toContain("reportComponentCrash");
  });

  it("has retry handler that resets state", () => {
    expect(src).toContain("handleRetry");
    expect(src).toContain("hasError: false");
  });

  it("supports custom fallback prop", () => {
    expect(src).toContain("this.props.fallback");
  });

  it("supports onError callback prop", () => {
    expect(src).toContain("this.props.onError");
  });

  it("Try Again button has accessibility", () => {
    expect(src).toContain('accessibilityLabel="Try again"');
  });

  it("Go Home button has accessibility", () => {
    expect(src).toContain('accessibilityLabel="Go to home screen"');
  });
});
