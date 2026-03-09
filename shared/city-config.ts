/**
 * Sprint 218: City Expansion Configuration
 * Single source of truth for all city-related configuration.
 * Owner: David Okonkwo (VP Product)
 *
 * When adding a new city:
 * 1. Add to CITY_REGISTRY below
 * 2. Run: npx tsx server/seed-cities.ts (seeds businesses)
 * 3. Update App Store metadata for new supported regions
 */

export interface CityConfig {
  name: string;
  state: string;
  stateCode: string;
  region: string;
  timezone: string;
  coordinates: { lat: number; lng: number };
  status: "active" | "beta" | "planned";
  launchDate?: string;
  minBusinesses: number;
}

export const CITY_REGISTRY: Record<string, CityConfig> = {
  Dallas: {
    name: "Dallas",
    state: "Texas",
    stateCode: "TX",
    region: "DFW Metroplex",
    timezone: "America/Chicago",
    coordinates: { lat: 32.7767, lng: -96.797 },
    status: "active",
    launchDate: "2026-03-09",
    minBusinesses: 10,
  },
  Austin: {
    name: "Austin",
    state: "Texas",
    stateCode: "TX",
    region: "Central Texas",
    timezone: "America/Chicago",
    coordinates: { lat: 30.2672, lng: -97.7431 },
    status: "active",
    launchDate: "2026-03-09",
    minBusinesses: 10,
  },
  Houston: {
    name: "Houston",
    state: "Texas",
    stateCode: "TX",
    region: "Greater Houston",
    timezone: "America/Chicago",
    coordinates: { lat: 29.7604, lng: -95.3698 },
    status: "active",
    launchDate: "2026-03-09",
    minBusinesses: 8,
  },
  "San Antonio": {
    name: "San Antonio",
    state: "Texas",
    stateCode: "TX",
    region: "South Texas",
    timezone: "America/Chicago",
    coordinates: { lat: 29.4241, lng: -98.4936 },
    status: "active",
    launchDate: "2026-03-09",
    minBusinesses: 7,
  },
  "Fort Worth": {
    name: "Fort Worth",
    state: "Texas",
    stateCode: "TX",
    region: "DFW Metroplex",
    timezone: "America/Chicago",
    coordinates: { lat: 32.7555, lng: -97.3308 },
    status: "active",
    launchDate: "2026-03-09",
    minBusinesses: 7,
  },
  // Phase 2 — planned for post-launch expansion
  "Oklahoma City": {
    name: "Oklahoma City",
    state: "Oklahoma",
    stateCode: "OK",
    region: "Central Oklahoma",
    timezone: "America/Chicago",
    coordinates: { lat: 35.4676, lng: -97.5164 },
    status: "beta",
    launchDate: "2026-03-09",
    minBusinesses: 10,
  },
  "New Orleans": {
    name: "New Orleans",
    state: "Louisiana",
    stateCode: "LA",
    region: "Greater New Orleans",
    timezone: "America/Chicago",
    coordinates: { lat: 29.9511, lng: -90.0715 },
    status: "planned",
    minBusinesses: 10,
  },
} as const;

/** Get all active city names */
export function getActiveCities(): string[] {
  return Object.values(CITY_REGISTRY)
    .filter((c) => c.status === "active")
    .map((c) => c.name);
}

/** Get all planned city names */
export function getPlannedCities(): string[] {
  return Object.values(CITY_REGISTRY)
    .filter((c) => c.status === "planned")
    .map((c) => c.name);
}

/** Get city config by name */
export function getCityConfig(name: string): CityConfig | undefined {
  return CITY_REGISTRY[name];
}

/** Check if a city is active */
export function isCityActive(name: string): boolean {
  return CITY_REGISTRY[name]?.status === "active";
}

/** City count by status */
export function getCityStats(): { active: number; beta: number; planned: number; total: number } {
  const cities = Object.values(CITY_REGISTRY);
  return {
    active: cities.filter((c) => c.status === "active").length,
    beta: cities.filter((c) => c.status === "beta").length,
    planned: cities.filter((c) => c.status === "planned").length,
    total: cities.length,
  };
}

/** Sprint 226: Get all beta city names — used by city picker to show beta badge */
export function getBetaCities(): string[] {
  return Object.values(CITY_REGISTRY)
    .filter((c) => c.status === "beta")
    .map((c) => c.name);
}

/** Sprint 226: Get a city's badge status for the frontend city picker */
export function getCityBadge(name: string): "active" | "beta" | "planned" | "unknown" {
  return CITY_REGISTRY[name]?.status ?? "unknown";
}
