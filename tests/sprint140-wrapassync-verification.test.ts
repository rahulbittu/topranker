/**
 * Sprint 140 — wrapAsync Verification Tests
 *
 * Proves wrapAsync effectiveness operationally (external critique priority #2).
 * Validates error propagation, response shape consistency, headersSent guard,
 * and non-interference with custom error handling in converted routes.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ---------- inline wrapAsync (mirrors server/wrap-async.ts) ----------
// We import the real implementation so the test is not tautological.
// vi.mock the logger to capture calls without side-effects.
vi.mock("../server/logger", () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    tag: () => ({
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

import { wrapAsync } from "../server/wrap-async";
import { log } from "../server/logger";

// ---------- helpers: mock Express objects ----------
function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    method: "GET",
    path: "/api/test",
    params: {},
    query: {},
    body: {},
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function mockRes() {
  const res: Record<string, any> = {
    headersSent: false,
    statusCode: 200,
    _body: null as any,
  };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((body: any) => {
    res._body = body;
    return res;
  });
  res.send = vi.fn((body: any) => {
    res._body = body;
    return res;
  });
  return res as unknown as Response & { statusCode: number; _body: any };
}

function mockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction;
}

// ---------- Test suites ----------

describe("wrapAsync — core behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a function (middleware signature)", () => {
    const handler = wrapAsync(async () => {});
    expect(typeof handler).toBe("function");
    expect(handler.length).toBe(3); // (req, res, next)
  });

  it("delegates to the wrapped handler on success", async () => {
    const spy = vi.fn(async (_req: Request, res: Response) => {
      res.json({ data: "ok" });
    });
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    wrapAsync(spy)(req, res, next);
    // Let the microtask resolve
    await new Promise((r) => setTimeout(r, 0));

    expect(spy).toHaveBeenCalledWith(req, res, next);
    expect(res._body).toEqual({ data: "ok" });
    expect(res.statusCode).toBe(200);
  });

  it("catches rejected promises and responds with 500", async () => {
    const handler = wrapAsync(async () => {
      throw new Error("DB connection lost");
    });
    const req = mockReq({ method: "POST", path: "/api/ratings" });
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect((res.status as any)).toHaveBeenCalledWith(500);
    expect(res._body).toEqual({ error: "DB connection lost" });
  });

  it("checks headersSent before responding", async () => {
    const handler = wrapAsync(async (_req: Request, res: Response) => {
      // Simulate headers already sent (e.g. streaming response started)
      (res as any).headersSent = true;
      throw new Error("late error after stream start");
    });
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    // Should NOT have called status/json since headers are already sent
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("logs the error with method + path", async () => {
    const handler = wrapAsync(async () => {
      throw new Error("something broke");
    });
    const req = mockReq({ method: "DELETE", path: "/api/businesses/42" });
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(log.error).toHaveBeenCalledWith(
      "Unhandled route error: DELETE /api/businesses/42",
      expect.any(Error)
    );
  });

  it("passes the error message in the JSON response", async () => {
    const handler = wrapAsync(async () => {
      throw new Error("Unique constraint violated");
    });
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(res._body).toEqual({ error: "Unique constraint violated" });
  });

  it("falls back to 'Internal Server Error' when error has no message", async () => {
    const handler = wrapAsync(async () => {
      throw new Error();
    });
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    // Error() produces empty string message — wrapAsync uses || fallback
    expect(res._body).toEqual({ error: "Internal Server Error" });
  });

  it("handles non-Error throws (string, object)", async () => {
    const handler = wrapAsync(async () => {
      throw "raw string error"; // eslint-disable-line no-throw-literal
    });
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    // A thrown string has no .message property
    expect((res.status as any)).toHaveBeenCalledWith(500);
    expect(res._body).toEqual({ error: "Internal Server Error" });
  });
});

describe("wrapAsync — error shape consistency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("response body has exactly { error: string } shape", async () => {
    const handler = wrapAsync(async () => {
      throw new Error("test error");
    });
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    const body = res._body;
    expect(Object.keys(body)).toEqual(["error"]);
    expect(typeof body.error).toBe("string");
  });

  it("status is always 500 for unhandled errors", async () => {
    const errors = [
      new Error("TypeError equivalent"),
      new Error("RangeError equivalent"),
      new Error("ReferenceError equivalent"),
    ];

    for (const err of errors) {
      const handler = wrapAsync(async () => {
        throw err;
      });
      const res = mockRes();
      handler(mockReq(), res, mockNext());
      await new Promise((r) => setTimeout(r, 0));
      expect(res.statusCode).toBe(500);
    }
  });

  it("no stack trace leaks in the response", async () => {
    const handler = wrapAsync(async () => {
      throw new Error("secret internal detail");
    });
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    const body = JSON.stringify(res._body);
    expect(body).not.toContain("at ");
    expect(body).not.toContain("node_modules");
    expect(body).not.toContain(".ts:");
    expect(body).not.toContain(".js:");
    expect(body).not.toContain("stack");
  });
});

describe("wrapAsync — custom error handling non-interference", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("route returning 400 keeps its behavior (auth validation)", async () => {
    const handler = wrapAsync(async (req: Request, res: Response) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
      res.json({ data: "registered" });
    });

    const req = mockReq({ body: { email: "", password: "" } });
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(res.statusCode).toBe(400);
    expect(res._body).toEqual({ error: "All fields are required" });
    // wrapAsync should not have logged anything — no error was thrown
    expect(log.error).not.toHaveBeenCalled();
  });

  it("route returning 400 for category suggestions keeps behavior", async () => {
    const handler = wrapAsync(async (req: Request, res: Response) => {
      const { name } = req.body;
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: "Category name is required" });
      }
      res.status(201).json({ data: { id: 1, name } });
    });

    const req = mockReq({ body: { name: "" } });
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(res.statusCode).toBe(400);
    expect(res._body).toEqual({ error: "Category name is required" });
    expect(log.error).not.toHaveBeenCalled();
  });

  it("route returning 403 for suspended users keeps behavior", async () => {
    const handler = wrapAsync(async (_req: Request, res: Response) => {
      // Simulates the ratings route pattern: custom catch inside wrapAsync
      try {
        throw new Error("Account suspended — contact support");
      } catch (err: any) {
        if (err.message.includes("suspended")) {
          return res.status(403).json({ error: err.message });
        }
        throw err; // re-throw for wrapAsync to handle
      }
    });

    const req = mockReq({ method: "POST", path: "/api/ratings" });
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(res.statusCode).toBe(403);
    expect(res._body).toEqual({ error: "Account suspended — contact support" });
    // Custom handling caught it — wrapAsync should not log
    expect(log.error).not.toHaveBeenCalled();
  });

  it("route returning 409 for duplicate ratings keeps behavior", async () => {
    const handler = wrapAsync(async (_req: Request, res: Response) => {
      try {
        throw new Error("Already rated this business");
      } catch (err: any) {
        if (err.message.includes("Already rated")) {
          return res.status(409).json({ error: err.message });
        }
        throw err;
      }
    });

    const req = mockReq({ method: "POST", path: "/api/ratings" });
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(res.statusCode).toBe(409);
    expect(res._body).toEqual({ error: "Already rated this business" });
    expect(log.error).not.toHaveBeenCalled();
  });

  it("route returning 403 for rate-limit (3+ days) keeps behavior", async () => {
    const handler = wrapAsync(async (_req: Request, res: Response) => {
      try {
        throw new Error("Must wait 3+ days between ratings");
      } catch (err: any) {
        if (err.message.includes("3+ days")) {
          return res.status(403).json({ error: err.message });
        }
        throw err;
      }
    });

    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(res.statusCode).toBe(403);
    expect(res._body).toEqual({ error: "Must wait 3+ days between ratings" });
    expect(log.error).not.toHaveBeenCalled();
  });

  it("wrapAsync catches errors that fall through custom handling", async () => {
    const handler = wrapAsync(async (_req: Request, res: Response) => {
      try {
        throw new Error("Unexpected database timeout");
      } catch (err: any) {
        // Custom handling only covers specific cases
        if (err.message.includes("suspended")) {
          return res.status(403).json({ error: err.message });
        }
        if (err.message.includes("Already rated")) {
          return res.status(409).json({ error: err.message });
        }
        // Unknown error — re-throw for wrapAsync to catch
        throw err;
      }
    });

    const req = mockReq({ method: "POST", path: "/api/ratings" });
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    // wrapAsync should catch the re-thrown error
    expect(res.statusCode).toBe(500);
    expect(res._body).toEqual({ error: "Unexpected database timeout" });
    expect(log.error).toHaveBeenCalledWith(
      "Unhandled route error: POST /api/ratings",
      expect.objectContaining({ message: "Unexpected database timeout" })
    );
  });

  it("successful routes pass through without interference", async () => {
    const handler = wrapAsync(async (_req: Request, res: Response) => {
      res.status(201).json({ data: { id: 99, name: "New Business" } });
    });

    const req = mockReq({ method: "POST", path: "/api/businesses" });
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(res.statusCode).toBe(201);
    expect(res._body).toEqual({ data: { id: 99, name: "New Business" } });
    expect(log.error).not.toHaveBeenCalled();
  });
});

describe("wrapAsync — edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles async rejection (not throw)", async () => {
    const handler = wrapAsync(async () => {
      return Promise.reject(new Error("Promise.reject path"));
    });
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    expect(res.statusCode).toBe(500);
    expect(res._body).toEqual({ error: "Promise.reject path" });
  });

  it("handles error thrown after partial response setup", async () => {
    const handler = wrapAsync(async (_req: Request, res: Response) => {
      // Handler sets status but throws before json()
      res.status(201);
      throw new Error("Crash after status set");
    });
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    handler(req, res, next);
    await new Promise((r) => setTimeout(r, 0));

    // wrapAsync overrides the status to 500
    expect(res.statusCode).toBe(500);
    expect(res._body).toEqual({ error: "Crash after status set" });
  });

  it("handles multiple sequential calls without state leakage", async () => {
    const handler = wrapAsync(async (req: Request, res: Response) => {
      if (req.path === "/fail") throw new Error("fail path");
      res.json({ ok: true });
    });

    // First call — success
    const res1 = mockRes();
    handler(mockReq({ path: "/ok" }), res1, mockNext());
    await new Promise((r) => setTimeout(r, 0));
    expect(res1.statusCode).toBe(200);

    // Second call — failure
    const res2 = mockRes();
    handler(mockReq({ path: "/fail" }), res2, mockNext());
    await new Promise((r) => setTimeout(r, 0));
    expect(res2.statusCode).toBe(500);

    // Third call — success again (no contamination)
    const res3 = mockRes();
    handler(mockReq({ path: "/ok" }), res3, mockNext());
    await new Promise((r) => setTimeout(r, 0));
    expect(res3.statusCode).toBe(200);
  });
});
