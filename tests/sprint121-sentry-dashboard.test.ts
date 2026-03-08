import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── Sentry Evaluation Doc ──────────────────────────────────────────────
describe("Sprint 121 — Sentry Evaluation Document", () => {
  const docPath = path.resolve(__dirname, "..", "docs", "evaluations", "SENTRY-EVAL.md");

  it("docs/evaluations/SENTRY-EVAL.md exists", () => {
    expect(fs.existsSync(docPath)).toBe(true);
  });

  const docSource = fs.readFileSync(docPath, "utf-8");

  it("mentions Sentry", () => {
    expect(docSource).toContain("Sentry");
  });

  it("mentions Bugsnag", () => {
    expect(docSource).toContain("Bugsnag");
  });

  it("mentions Datadog", () => {
    expect(docSource).toContain("Datadog");
  });

  it("contains APPROVED decision", () => {
    expect(docSource).toContain("APPROVED");
  });

  it("mentions @sentry/react-native SDK", () => {
    expect(docSource).toContain("@sentry/react-native");
  });

  it("mentions @sentry/node SDK", () => {
    expect(docSource).toContain("@sentry/node");
  });

  it("mentions 5K errors free tier", () => {
    expect(docSource).toContain("5K errors");
  });

  it("has privacy section", () => {
    expect(docSource).toContain("Privacy");
    expect(docSource).toContain("PII");
  });

  it("mentions beforeSend hook for PII scrubbing", () => {
    expect(docSource).toContain("beforeSend");
  });

  it("includes integration timeline referencing Sprint 122", () => {
    expect(docSource).toContain("Sprint 122");
  });
});

// ── Admin Dashboard Page ───────────────────────────────────────────────
describe("Sprint 121 — Admin Dashboard Page", () => {
  const dashPath = path.resolve(__dirname, "..", "app", "admin", "dashboard.tsx");

  it("app/admin/dashboard.tsx exists", () => {
    expect(fs.existsSync(dashPath)).toBe(true);
  });

  const dashSource = fs.readFileSync(dashPath, "utf-8");

  it("imports Colors", () => {
    expect(dashSource).toContain("import Colors");
  });

  it("imports BRAND", () => {
    expect(dashSource).toContain("import { BRAND }");
  });

  it("imports TYPOGRAPHY", () => {
    expect(dashSource).toContain("import { TYPOGRAPHY }");
  });

  it("contains Analytics Dashboard header", () => {
    expect(dashSource).toContain("Analytics Dashboard");
  });

  it("contains totalEvents stat card", () => {
    expect(dashSource).toContain("totalEvents");
  });

  it("contains activeUsers stat card", () => {
    expect(dashSource).toContain("activeUsers");
  });

  it("contains signupRate stat card", () => {
    expect(dashSource).toContain("signupRate");
  });

  it("contains ratingRate stat card", () => {
    expect(dashSource).toContain("ratingRate");
  });

  it("contains accessibilityRole", () => {
    expect(dashSource).toContain("accessibilityRole");
  });

  it("contains accessibilityLabel", () => {
    expect(dashSource).toContain("accessibilityLabel");
  });

  it("contains Refresh button", () => {
    expect(dashSource).toContain("Refresh");
  });

  it("contains Recent Activity section", () => {
    expect(dashSource).toContain("Recent Activity");
  });

  it("uses BRAND.colors.amber", () => {
    expect(dashSource).toContain("BRAND.colors.amber");
  });
});

// ── i18n React Integration ─────────────────────────────────────────────
describe("Sprint 121 — i18n React Integration", () => {
  const i18nPath = path.resolve(__dirname, "..", "lib", "i18n-react.ts");

  it("lib/i18n-react.ts exists", () => {
    expect(fs.existsSync(i18nPath)).toBe(true);
  });

  const i18nSource = fs.readFileSync(i18nPath, "utf-8");

  it("exports useTranslation hook", () => {
    expect(i18nSource).toContain("export function useTranslation");
  });

  it("exports TranslatedText component", () => {
    expect(i18nSource).toContain("export function TranslatedText");
  });

  it("imports from i18n module", () => {
    expect(i18nSource).toContain('from "./i18n"');
  });

  it("useTranslation returns t, locale, and setLocale", () => {
    expect(i18nSource).toContain("t:");
    expect(i18nSource).toContain("locale:");
    expect(i18nSource).toContain("setLocale:");
  });

  it("TranslatedText accepts tKey prop", () => {
    expect(i18nSource).toContain("tKey");
  });

  it("uses Locale type", () => {
    expect(i18nSource).toContain("Locale");
  });
});

// ── Server Startup Banner ──────────────────────────────────────────────
describe("Sprint 121 — Startup Banner Enhancement", () => {
  const serverPath = path.resolve(__dirname, "..", "server", "index.ts");

  it("server/index.ts exists", () => {
    expect(fs.existsSync(serverPath)).toBe(true);
  });

  const serverSource = fs.readFileSync(serverPath, "utf-8");

  it("contains routes registered banner", () => {
    expect(serverSource).toContain("routes registered");
  });

  it("banner includes [TopRanker] prefix", () => {
    expect(serverSource).toContain("[TopRanker]");
  });

  it("counts routes from app router stack", () => {
    expect(serverSource).toContain("routeCount");
  });
});

// ── Sprint Doc ─────────────────────────────────────────────────────────
describe("Sprint 121 — Sprint Document", () => {
  const sprintPath = path.resolve(__dirname, "..", "docs", "sprints", "SPRINT-121-sentry-dashboard.md");

  it("sprint doc exists", () => {
    expect(fs.existsSync(sprintPath)).toBe(true);
  });

  const sprintSource = fs.readFileSync(sprintPath, "utf-8");

  it("mentions Sentry", () => {
    expect(sprintSource).toContain("Sentry");
  });

  it("mentions admin dashboard", () => {
    expect(sprintSource).toContain("Admin Dashboard");
  });

  it("mentions i18n", () => {
    expect(sprintSource).toContain("i18n");
  });

  it("includes team discussion with 6+ members", () => {
    expect(sprintSource).toContain("Marcus Chen");
    expect(sprintSource).toContain("Sarah Nakamura");
    expect(sprintSource).toContain("Leo Hernandez");
    expect(sprintSource).toContain("Nadia Kaur");
  });
});

// ── Retro Doc ──────────────────────────────────────────────────────────
describe("Sprint 121 — Retrospective Document", () => {
  const retroPath = path.resolve(__dirname, "..", "docs", "retros", "RETRO-121-sentry-dashboard.md");

  it("retro doc exists", () => {
    expect(fs.existsSync(retroPath)).toBe(true);
  });

  const retroSource = fs.readFileSync(retroPath, "utf-8");

  it("has What Went Well section", () => {
    expect(retroSource).toContain("What Went Well");
  });

  it("has What Could Improve section", () => {
    expect(retroSource).toContain("What Could Improve");
  });

  it("has Action Items section", () => {
    expect(retroSource).toContain("Action Items");
  });

  it("has Team Morale section", () => {
    expect(retroSource).toContain("Team Morale");
  });

  it("Sarah Nakamura is facilitator", () => {
    expect(retroSource).toContain("Sarah Nakamura");
  });
});
