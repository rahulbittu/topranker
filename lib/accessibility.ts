/**
 * Accessibility Testing Utility — Sprint 117
 * Automated checks for component accessibility compliance.
 * Owner: Leo Hernandez (Design), Jordan Blake (Compliance)
 *
 * Verifies that key UI components have proper accessibilityRole
 * and accessibilityLabel attributes per WCAG 2.1 AA guidelines.
 */
import fs from "fs";
import path from "path";

export interface AccessibilityIssue {
  component: string;
  issue: string;
  severity: "error" | "warning" | "info";
  timestamp: number;
}

const issues: AccessibilityIssue[] = [];

/**
 * Check if a component file contains accessibilityLabel.
 * Returns true if the component has at least one accessibilityLabel.
 */
export function checkAccessibilityLabel(component: string): boolean {
  try {
    const filePath = path.resolve(__dirname, "..", "components", `${component}.tsx`);
    if (!fs.existsSync(filePath)) {
      issues.push({
        component,
        issue: `Component file not found: ${component}.tsx`,
        severity: "error",
        timestamp: Date.now(),
      });
      return false;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const hasLabel = content.includes("accessibilityLabel");
    if (!hasLabel) {
      issues.push({
        component,
        issue: `Missing accessibilityLabel in ${component}.tsx`,
        severity: "error",
        timestamp: Date.now(),
      });
    }
    return hasLabel;
  } catch (err) {
    issues.push({
      component,
      issue: `Error reading ${component}: ${(err as Error).message}`,
      severity: "error",
      timestamp: Date.now(),
    });
    return false;
  }
}

/**
 * Check if a component file contains accessibilityRole.
 * Returns true if the component has at least one accessibilityRole.
 */
export function checkAccessibilityRole(component: string): boolean {
  try {
    const filePath = path.resolve(__dirname, "..", "components", `${component}.tsx`);
    if (!fs.existsSync(filePath)) {
      return false;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const hasRole = content.includes("accessibilityRole");
    if (!hasRole) {
      issues.push({
        component,
        issue: `Missing accessibilityRole in ${component}.tsx`,
        severity: "warning",
        timestamp: Date.now(),
      });
    }
    return hasRole;
  } catch {
    return false;
  }
}

/**
 * Get all recorded accessibility issues.
 */
export function getAccessibilityReport(): AccessibilityIssue[] {
  return [...issues];
}

/**
 * Clear all recorded accessibility issues (useful between test runs).
 */
export function clearAccessibilityIssues(): void {
  issues.length = 0;
}

/**
 * Run a full accessibility audit on key components.
 * Returns a summary of issues found.
 */
export function runAccessibilityAudit(): {
  passed: string[];
  failed: string[];
  issues: AccessibilityIssue[];
} {
  const components = ["ErrorBoundary", "CookieConsent", "NavigationRow", "SettingRow"];
  const passed: string[] = [];
  const failed: string[] = [];

  for (const component of components) {
    const hasLabel = checkAccessibilityLabel(component);
    const hasRole = checkAccessibilityRole(component);
    if (hasLabel && hasRole) {
      passed.push(component);
    } else {
      failed.push(component);
    }
  }

  return { passed, failed, issues: getAccessibilityReport() };
}
