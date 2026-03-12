/**
 * Sprint 741: Crypto ID Standardization + Silent Error Recovery
 *
 * Validates:
 * 1. Server modules use crypto.randomUUID() instead of Math.random() for IDs
 * 2. Claim verification codes use crypto.randomInt() instead of Math.random()
 * 3. Empty catch blocks replaced with __DEV__-guarded error logging
 * 4. QR print window sanitizes business name to prevent XSS
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readSource(filePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), filePath), "utf-8");
}

describe("Sprint 741: Crypto ID Standardization", () => {
  describe("security-headers.ts", () => {
    const src = readSource("server/security-headers.ts");

    it("imports crypto module", () => {
      expect(src).toMatch(/import crypto from ["']crypto["']/);
    });

    it("uses crypto.randomUUID() for request IDs", () => {
      expect(src).toContain("crypto.randomUUID()");
    });

    it("does not use Math.random() for request IDs", () => {
      expect(src).not.toMatch(/Math\.random\(\)\.toString\(36\)/);
    });
  });

  describe("rate-limit-dashboard.ts", () => {
    const src = readSource("server/rate-limit-dashboard.ts");

    it("imports crypto module", () => {
      expect(src).toMatch(/import crypto from ["']crypto["']/);
    });

    it("uses crypto.randomUUID() for event IDs", () => {
      expect(src).toContain("crypto.randomUUID()");
    });

    it("does not use Math.random() for event IDs", () => {
      expect(src).not.toMatch(/Math\.random\(\)\.toString\(36\)/);
    });

    it("prefixes rate-limit event IDs with rl_", () => {
      expect(src).toContain("`rl_${crypto.randomUUID()}`");
    });
  });

  describe("alerting.ts", () => {
    const src = readSource("server/alerting.ts");

    it("imports crypto module", () => {
      expect(src).toMatch(/import crypto from ["']crypto["']/);
    });

    it("uses crypto.randomUUID() for alert IDs", () => {
      expect(src).toContain("crypto.randomUUID()");
    });

    it("does not use Math.random() for alert IDs", () => {
      expect(src).not.toMatch(/Math\.random\(\)\.toString\(36\)/);
    });

    it("prefixes alert IDs with alert_", () => {
      expect(src).toContain("`alert_${crypto.randomUUID()}`");
    });
  });

  describe("abuse-detection.ts", () => {
    const src = readSource("server/abuse-detection.ts");

    it("imports crypto module", () => {
      expect(src).toMatch(/import crypto from ["']crypto["']/);
    });

    it("uses crypto.randomUUID() for incident IDs", () => {
      expect(src).toContain("crypto.randomUUID()");
    });

    it("does not use Math.random() for incident IDs", () => {
      expect(src).not.toMatch(/Math\.random\(\)\.toString\(36\)/);
    });

    it("prefixes abuse IDs with abuse_", () => {
      expect(src).toContain("`abuse_${crypto.randomUUID()}`");
    });
  });

  describe("storage/claims.ts", () => {
    const src = readSource("server/storage/claims.ts");

    it("imports crypto module", () => {
      expect(src).toMatch(/import crypto from ["']crypto["']/);
    });

    it("uses crypto.randomInt() for verification codes", () => {
      expect(src).toContain("crypto.randomInt(100000, 999999)");
    });

    it("does not use Math.random() for verification codes", () => {
      expect(src).not.toMatch(/Math\.floor\(100000 \+ Math\.random\(\)/);
    });

    it("generates 6-digit verification codes", () => {
      // crypto.randomInt(100000, 999999) always produces 6 digits
      expect(src).toMatch(/randomInt\(100000,\s*999999\)/);
    });
  });
});

describe("Sprint 741: Silent Error Recovery", () => {
  describe("app/_layout.tsx — notification open reporting", () => {
    const src = readSource("app/_layout.tsx");

    it("logs notification report failures in dev mode", () => {
      expect(src).toContain('console.warn("[Notification] Failed to report open:"');
    });

    it("guards notification error log with __DEV__", () => {
      expect(src).toMatch(/if \(__DEV__\) console\.warn\("\[Notification\]/);
    });

    it("does not silently swallow notification errors", () => {
      // The old pattern was .catch(() => {}) on reportNotificationOpened
      expect(src).not.toMatch(/reportNotificationOpened\([^)]+\)\.catch\(\(\)\s*=>\s*\{\}\)/);
    });
  });

  describe("app/(tabs)/index.tsx — category suggestion", () => {
    const src = readSource("app/(tabs)/index.tsx");

    it("logs suggestion failures in dev mode", () => {
      expect(src).toContain('console.warn("[Suggest] Failed to submit:"');
    });

    it("does not silently swallow suggestion errors", () => {
      expect(src).not.toMatch(/submitCategorySuggestion\([^)]+\)\.catch\(\(\)\s*=>\s*\{\}\)/);
    });
  });

  describe("app/business/qr.tsx — share error", () => {
    const src = readSource("app/business/qr.tsx");

    it("logs share failures in dev mode", () => {
      expect(src).toContain('console.warn("[QR] Share failed:"');
    });

    it("does not have empty catch block", () => {
      expect(src).not.toMatch(/catch\s*\{\s*\}/);
    });
  });
});

describe("Sprint 741: QR Print XSS Prevention", () => {
  const src = readSource("app/business/qr.tsx");

  it("sanitizes business name before HTML injection", () => {
    expect(src).toContain(".replace(/[<>\"&]/g,");
  });

  it("uses safeName variable in print HTML", () => {
    expect(src).toMatch(/\$\{safeName\}/);
  });

  it("does not inject raw name into print HTML body", () => {
    // The <body> section should use safeName, not raw name
    const bodyMatch = src.match(/<body>.*?<\/body>/s);
    if (bodyMatch) {
      expect(bodyMatch[0]).not.toMatch(/\$\{name\}/);
    }
  });

  it("escapes < > \" & characters", () => {
    expect(src).toContain("&lt;");
    expect(src).toContain("&gt;");
    expect(src).toContain("&quot;");
    expect(src).toContain("&amp;");
  });
});
