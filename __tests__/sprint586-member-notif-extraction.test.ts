/**
 * Sprint 586: routes-members.ts Notification Extraction
 *
 * Tests:
 * 1. routes-member-notifications.ts module structure
 * 2. All 5 notification endpoints present
 * 3. routes-members.ts no longer contains notification endpoints
 * 4. routes.ts wires new module
 * 5. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 586: routes-member-notifications.ts Module", () => {
  const src = readFile("server/routes-member-notifications.ts");

  it("exports registerMemberNotificationRoutes function", () => {
    expect(src).toContain("export function registerMemberNotificationRoutes");
  });

  it("has POST /api/members/me/push-token endpoint", () => {
    expect(src).toContain("/api/members/me/push-token");
  });

  it("has GET /api/members/me/notification-preferences endpoint", () => {
    expect(src).toContain('app.get("/api/members/me/notification-preferences"');
  });

  it("has PUT /api/members/me/notification-preferences endpoint", () => {
    expect(src).toContain('app.put("/api/members/me/notification-preferences"');
  });

  it("has GET /api/members/me/notification-frequency endpoint", () => {
    expect(src).toContain('app.get("/api/members/me/notification-frequency"');
  });

  it("has PUT /api/members/me/notification-frequency endpoint", () => {
    expect(src).toContain('app.put("/api/members/me/notification-frequency"');
  });

  it("uses requireAuth middleware", () => {
    expect(src).toContain("requireAuth");
  });

  it("imports from storage for preferences", () => {
    expect(src).toContain("updateNotificationPrefs");
    expect(src).toContain("updateNotificationFrequencyPrefs");
    expect(src).toContain("updatePushToken");
  });

  it("module LOC under 100", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(100);
  });
});

describe("Sprint 586: routes-members.ts After Extraction", () => {
  const src = readFile("server/routes-members.ts");

  it("no longer contains push-token endpoint", () => {
    expect(src).not.toContain('app.post("/api/members/me/push-token"');
  });

  it("no longer contains notification-preferences endpoints", () => {
    expect(src).not.toContain('app.get("/api/members/me/notification-preferences"');
    expect(src).not.toContain('app.put("/api/members/me/notification-preferences"');
  });

  it("no longer contains notification-frequency endpoints", () => {
    expect(src).not.toContain('app.get("/api/members/me/notification-frequency"');
    expect(src).not.toContain('app.put("/api/members/me/notification-frequency"');
  });

  it("references extraction in comment", () => {
    expect(src).toContain("routes-member-notifications.ts");
  });

  it("LOC under 225 after extraction", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(225);
  });
});

describe("Sprint 586: Route Wiring", () => {
  const src = readFile("server/routes.ts");

  it("imports registerMemberNotificationRoutes", () => {
    expect(src).toContain('import { registerMemberNotificationRoutes } from "./routes-member-notifications"');
  });

  it("calls registerMemberNotificationRoutes(app)", () => {
    expect(src).toContain("registerMemberNotificationRoutes(app)");
  });
});
