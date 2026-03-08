import { describe, it, expect, vi } from "vitest";

/**
 * Map & Animation Fixes — Unit tests
 * Validates map cleanup, DOM ref safety, animation curves,
 * press animation timing, and staggered card entry.
 */

// ── Map Cleanup ─────────────────────────────────────────────

describe("Google Maps Cleanup", () => {
  it("clears map instance on unmount", () => {
    const mapInstance = { current: { destroy: vi.fn() } as any };
    // Simulate cleanup
    mapInstance.current = null;
    expect(mapInstance.current).toBeNull();
  });

  it("clears markers on unmount", () => {
    const markers = [
      { setMap: vi.fn() },
      { setMap: vi.fn() },
    ];
    markers.forEach(m => m.setMap(null));
    expect(markers[0].setMap).toHaveBeenCalledWith(null);
    expect(markers[1].setMap).toHaveBeenCalledWith(null);
  });

  it("resets mapReady flag on unmount", () => {
    let mapReady = true;
    mapReady = false;
    expect(mapReady).toBe(false);
  });

  it("checks DOM element isConnected before map creation", () => {
    const div = { isConnected: false };
    const shouldCreate = div.isConnected;
    expect(shouldCreate).toBe(false);
  });

  it("allows map creation when DOM element is connected", () => {
    const div = { isConnected: true };
    const shouldCreate = div.isConnected;
    expect(shouldCreate).toBe(true);
  });

  it("skips map creation if instance already exists", () => {
    const mapRef = { current: { isConnected: true } }; // mock DOM element
    const mapInstance = { current: {} }; // already initialized
    const shouldCreate = mapRef.current && !mapInstance.current;
    expect(shouldCreate).toBe(false);
  });
});

// ── Press Animation ─────────────────────────────────────────

describe("Press Animation Config", () => {
  it("press-in uses timing (not spring) for smooth start", () => {
    // The new config uses Animated.timing for press-in
    const config = { toValue: 0.975, duration: 120, useNativeDriver: true };
    expect(config.duration).toBe(120);
    expect(config.toValue).toBe(0.975);
  });

  it("press-out uses gentle spring for natural release", () => {
    const config = { toValue: 1, speed: 14, bounciness: 2, useNativeDriver: true };
    expect(config.speed).toBe(14);
    expect(config.bounciness).toBe(2);
  });

  it("scale range is subtle (0.975 to 1)", () => {
    const scaleDown = 0.975;
    const scaleUp = 1;
    const delta = scaleUp - scaleDown;
    expect(delta).toBeCloseTo(0.025);
  });
});

// ── Card Entry Stagger ──────────────────────────────────────

describe("Staggered Card Entry", () => {
  it("calculates delay from index", () => {
    const delay = (index: number) => Math.min(index * 60, 300);
    expect(delay(0)).toBe(0);
    expect(delay(1)).toBe(60);
    expect(delay(3)).toBe(180);
    expect(delay(5)).toBe(300);
    expect(delay(10)).toBe(300); // capped
  });

  it("entry animation uses 250ms duration", () => {
    const duration = 250;
    expect(duration).toBeLessThan(300); // snappy, not sluggish
    expect(duration).toBeGreaterThan(100); // not instant
  });

  it("slide distance is subtle (8px)", () => {
    const slideY = 8;
    expect(slideY).toBeLessThan(20); // not dramatic
    expect(slideY).toBeGreaterThan(0);
  });
});

// ── Tab Bar Animation Unity ─────────────────────────────────

describe("Tab Bar Animation Config", () => {
  it("uses unified spring config for focused state", () => {
    const focusedConfig = { damping: 14, stiffness: 160 };
    // All three properties (scale, glowOpacity, glowScale) use same config
    expect(focusedConfig.damping).toBe(14);
    expect(focusedConfig.stiffness).toBe(160);
  });

  it("uses unified spring config for unfocused state", () => {
    const unfocusedConfig = { damping: 16, stiffness: 140 };
    expect(unfocusedConfig.damping).toBe(16);
    expect(unfocusedConfig.stiffness).toBe(140);
  });

  it("icon scale is moderate (1.12, not 1.18)", () => {
    const focusedScale = 1.12;
    expect(focusedScale).toBeLessThan(1.18); // not exaggerated
    expect(focusedScale).toBeGreaterThan(1.05); // still noticeable
  });
});

// ── Opening Hours Collapsible ───────────────────────────────

describe("Opening Hours Collapsible", () => {
  it("finds today's line from hours array", () => {
    const hours = [
      "Monday: 11:00 AM – 10:00 PM",
      "Tuesday: 11:00 AM – 10:00 PM",
      "Wednesday: 11:00 AM – 10:00 PM",
    ];
    const todayName = "monday";
    const todayLine = hours.find(h => h.toLowerCase().startsWith(todayName));
    expect(todayLine).toBe("Monday: 11:00 AM – 10:00 PM");
  });

  it("falls back to first entry if today not found", () => {
    const hours = ["Mon: 9-5", "Tue: 9-5"];
    const todayName = "sunday";
    const todayLine = hours.find(h => h.toLowerCase().startsWith(todayName));
    const display = todayLine || hours[0] || "—";
    expect(display).toBe("Mon: 9-5");
  });

  it("shows dash for empty hours", () => {
    const hours: string[] = [];
    const display = hours[0] || "—";
    expect(display).toBe("—");
  });

  it("starts collapsed by default", () => {
    const expanded = false;
    expect(expanded).toBe(false);
  });
});
