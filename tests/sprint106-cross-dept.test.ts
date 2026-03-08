/**
 * Sprint 106 Cross-Department Tests
 * Covers: Performance Monitor, SSE Security, Test Utils, Cookie Consent,
 *         Discover Tip Card, Tech Debt Registry
 * Owner: Sarah Nakamura (Lead Engineer)
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { mockRequest, mockResponse, mockNext, mockAdminRequest } from "./helpers/test-utils";

// ── 1. Performance Monitor ─────────────────────────────────────

describe("Performance Monitor", () => {
  it("perfMonitor is a function", async () => {
    const { perfMonitor } = await import("../server/perf-monitor");
    expect(typeof perfMonitor).toBe("function");
  });

  it("getPerfStats returns object with expected shape", async () => {
    const { getPerfStats } = await import("../server/perf-monitor");
    const stats = getPerfStats();
    expect(stats).toHaveProperty("totalRequests");
    expect(stats).toHaveProperty("slowRequests");
    expect(stats).toHaveProperty("avgDurationMs");
    expect(stats).toHaveProperty("maxDurationMs");
    expect(stats).toHaveProperty("slowestRoutes");
    expect(typeof stats.totalRequests).toBe("number");
    expect(typeof stats.slowRequests).toBe("number");
    expect(typeof stats.avgDurationMs).toBe("number");
    expect(typeof stats.maxDurationMs).toBe("number");
    expect(Array.isArray(stats.slowestRoutes)).toBe(true);
  });

  it("Server-Timing header is set after request finishes", async () => {
    const { perfMonitor } = await import("../server/perf-monitor");

    // Build a mock response that captures the "finish" listener
    let finishCb: (() => void) | null = null;
    const headers: Record<string, string> = {};
    const res = {
      on: (event: string, cb: () => void) => {
        if (event === "finish") finishCb = cb;
      },
      setHeader: (key: string, value: string) => {
        headers[key] = value;
      },
    } as any;

    const req = { method: "GET", path: "/test", route: { path: "/test" } } as any;
    const next = () => {};

    perfMonitor(req, res, next);

    // The middleware should have registered a finish listener
    expect(finishCb).not.toBeNull();

    // Simulate the response finishing
    finishCb!();

    expect(headers["Server-Timing"]).toBeDefined();
    expect(headers["Server-Timing"]).toMatch(/^total;dur=\d+(\.\d+)?$/);
  });

  it("stats accumulate across calls", async () => {
    const { perfMonitor, getPerfStats } = await import("../server/perf-monitor");

    const before = getPerfStats().totalRequests;

    // Fire two requests through the middleware
    for (let i = 0; i < 2; i++) {
      let finishCb: (() => void) | null = null;
      const res = {
        on: (event: string, cb: () => void) => {
          if (event === "finish") finishCb = cb;
        },
        setHeader: () => {},
      } as any;
      const req = { method: "GET", path: `/accumulate-${i}`, route: null } as any;

      perfMonitor(req, res, () => {});
      finishCb!();
    }

    const after = getPerfStats().totalRequests;
    expect(after).toBeGreaterThanOrEqual(before + 2);
  });
});

// ── 2. SSE Security ─────────────────────────────────────────────

describe("SSE Security", () => {
  it("max 5 SSE connections per IP", () => {
    // The constant SSE_MAX_PER_IP = 5 is defined inline in routes.ts.
    // We verify the value by reading the source file.
    const routesSrc = fs.readFileSync(
      path.resolve(__dirname, "../server/routes.ts"),
      "utf-8",
    );
    const match = routesSrc.match(/SSE_MAX_PER_IP\s*=\s*(\d+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBe(5);
  });

  it("30-minute timeout constant (1800000ms)", () => {
    const routesSrc = fs.readFileSync(
      path.resolve(__dirname, "../server/routes.ts"),
      "utf-8",
    );
    const match = routesSrc.match(/SSE_TIMEOUT_MS\s*=\s*([\d_]+)/);
    expect(match).not.toBeNull();
    // 1_800_000 with underscores becomes 1800000
    const value = Number(match![1].replace(/_/g, ""));
    expect(value).toBe(1_800_000);
  });

  it("connection counter increments and decrements", () => {
    // Validate the Map-based tracking logic exists in source
    const routesSrc = fs.readFileSync(
      path.resolve(__dirname, "../server/routes.ts"),
      "utf-8",
    );
    // Increment: sseConnectionsByIp.set(clientIp, currentCount + 1)
    expect(routesSrc).toContain("sseConnectionsByIp.set(clientIp, currentCount + 1)");
    // Decrement: sseConnectionsByIp.set(clientIp, count - 1)
    expect(routesSrc).toContain("sseConnectionsByIp.set(clientIp, count - 1)");
    // Cleanup on zero: sseConnectionsByIp.delete(clientIp)
    expect(routesSrc).toContain("sseConnectionsByIp.delete(clientIp)");
  });
});

// ── 3. Test Utils ───────────────────────────────────────────────

describe("Test Utils", () => {
  it("mockRequest returns object with ip, headers, isAuthenticated", () => {
    const req = mockRequest();
    expect(req.ip).toBe("127.0.0.1");
    expect(req.headers).toBeDefined();
    expect(typeof req.isAuthenticated).toBe("function");
    expect(req.isAuthenticated()).toBe(true);
  });

  it("mockResponse has setHeader, status, json methods", () => {
    const res = mockResponse();
    expect(typeof res.setHeader).toBe("function");
    expect(typeof res.status).toBe("function");
    expect(typeof res.json).toBe("function");

    // setHeader stores values
    res.setHeader("X-Test", "hello");
    expect(res.headers["X-Test"]).toBe("hello");

    // status returns res for chaining
    const chained = res.status(404);
    expect(chained).toBe(res);
    expect(res.statusCode).toBe(404);

    // json returns res for chaining
    const chained2 = res.json({ ok: true });
    expect(chained2).toBe(res);
    expect(res.jsonBody).toEqual({ ok: true });
  });

  it("mockAdminRequest has admin email", () => {
    const req = mockAdminRequest();
    expect(req.user.email).toBe("admin@topranker.com");
    expect(req.user.id).toBe("admin-1");
  });

  it("mockNext is a function", () => {
    expect(typeof mockNext).toBe("function");
    // Should not throw when called
    expect(() => mockNext()).not.toThrow();
  });
});

// ── 4. Cookie Consent Navigation ────────────────────────────────

describe("Cookie Consent", () => {
  it("'Learn more' navigates to /legal/privacy", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/CookieConsent.tsx"),
      "utf-8",
    );
    expect(src).toContain('router.push("/legal/privacy")');
  });

  it("CONSENT_KEY is 'cookie_consent_v1'", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/CookieConsent.tsx"),
      "utf-8",
    );
    const match = src.match(/CONSENT_KEY\s*=\s*"([^"]+)"/);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("cookie_consent_v1");
  });
});

// ── 5. Discover Tip Card ────────────────────────────────────────

describe("Discover Tip Card", () => {
  it("AsyncStorage key is 'discover_tip_dismissed'", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../app/(tabs)/search.tsx'),
      "utf-8",
    );
    expect(src).toContain('"discover_tip_dismissed"');
  });

  it("initial state is false (tip visible until dismissed)", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../app/(tabs)/search.tsx'),
      "utf-8",
    );
    // showDiscoverTip starts as false, then set to true if not dismissed
    expect(src).toContain("useState(false)");
    // Tip shows when val !== "true"
    expect(src).toContain('val !== "true"');
  });
});

// ── 6. Tech Debt Registry ───────────────────────────────────────

describe("Tech Debt Registry", () => {
  const debtPath = path.resolve(__dirname, "../docs/TECH-DEBT.md");

  it("TECH-DEBT.md exists", () => {
    expect(fs.existsSync(debtPath)).toBe(true);
  });

  it("has HIGH, MEDIUM, and LOW sections", () => {
    const content = fs.readFileSync(debtPath, "utf-8");
    expect(content).toContain("### HIGH Priority");
    expect(content).toContain("### MEDIUM Priority");
    expect(content).toContain("### LOW Priority");
  });
});
