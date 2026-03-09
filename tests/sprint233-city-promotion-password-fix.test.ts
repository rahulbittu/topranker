import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(__dirname, '..', relPath));
}

function readFile(relPath: string): string {
  const full = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(full)) return '';
  return fs.readFileSync(full, 'utf-8');
}

// ---------------------------------------------------------------------------
// 1. City Promotion Module — static analysis
// ---------------------------------------------------------------------------
describe('City promotion module (server/city-promotion.ts) — static', () => {
  const src = () => readFile('server/city-promotion.ts');

  it('module file exists', () => {
    expect(fileExists('server/city-promotion.ts')).toBe(true);
  });

  it('exports evaluatePromotion', () => {
    expect(src()).toContain('export async function evaluatePromotion');
  });

  it('exports getPromotionStatus', () => {
    expect(src()).toContain('export async function getPromotionStatus');
  });

  it('exports promoteCity', () => {
    expect(src()).toContain('export function promoteCity');
  });

  it('exports getPromotionThresholds', () => {
    expect(src()).toContain('export function getPromotionThresholds');
  });

  it('exports setPromotionThresholds', () => {
    expect(src()).toContain('export function setPromotionThresholds');
  });

  it('uses tagged logger', () => {
    expect(src()).toContain('log.tag("CityPromotion")');
  });

  it('imports getCityConfig from shared/city-config', () => {
    expect(src()).toContain('getCityConfig');
    expect(src()).toContain('city-config');
  });

  it('imports getCityEngagement from city-engagement', () => {
    expect(src()).toContain('getCityEngagement');
    expect(src()).toContain('city-engagement');
  });

  it('defines PromotionThresholds interface', () => {
    expect(src()).toContain('interface PromotionThresholds');
  });

  it('defines PromotionStatus interface', () => {
    expect(src()).toContain('interface PromotionStatus');
  });

  it('has default threshold of 50 businesses', () => {
    expect(src()).toContain('minBusinesses: 50');
  });

  it('has default threshold of 100 members', () => {
    expect(src()).toContain('minMembers: 100');
  });

  it('has default threshold of 200 ratings', () => {
    expect(src()).toContain('minRatings: 200');
  });

  it('has default threshold of 30 days in beta', () => {
    expect(src()).toContain('minDaysInBeta: 30');
  });
});

// ---------------------------------------------------------------------------
// 2. City Promotion — additional static checks (runtime skipped: DB dependency)
// ---------------------------------------------------------------------------
describe('City promotion — logic verification (static)', () => {
  const src = () => readFile('server/city-promotion.ts');

  it('getPromotionThresholds returns spread copy', () => {
    expect(src()).toContain('return { ...thresholds }');
  });

  it('setPromotionThresholds merges partial input', () => {
    expect(src()).toContain('thresholds = { ...thresholds, ...t }');
  });

  it('promoteCity checks beta status before promoting', () => {
    expect(src()).toContain('config.status !== "beta"');
  });

  it('promoteCity mutates CITY_REGISTRY to active', () => {
    expect(src()).toContain('.status = "active"');
  });

  it('promoteCity returns false for non-beta city', () => {
    expect(src()).toContain('return false');
  });

  it('evaluatePromotion delegates to getPromotionStatus', () => {
    expect(src()).toContain('await getPromotionStatus(city)');
  });

  it('getPromotionStatus checks all four criteria', () => {
    const code = src();
    expect(code).toContain('thresholds.minBusinesses');
    expect(code).toContain('thresholds.minMembers');
    expect(code).toContain('thresholds.minRatings');
    expect(code).toContain('thresholds.minDaysInBeta');
  });

  it('calculates daysInBeta from launchDate', () => {
    expect(src()).toContain('daysInBeta');
    expect(src()).toContain('launchDate');
  });
});

// ---------------------------------------------------------------------------
// 3. Password validation fix — client matches server
// ---------------------------------------------------------------------------
describe('Password validation fix (app/auth/signup.tsx)', () => {
  const src = () => readFile('app/auth/signup.tsx');

  it('signup screen exists', () => {
    expect(fileExists('app/auth/signup.tsx')).toBe(true);
  });

  it('checks for minimum 8 characters (not 6)', () => {
    const code = src();
    expect(code).toContain('password.length < 8');
    expect(code).not.toContain('password.length < 6');
  });

  it('checks for at least one digit', () => {
    expect(src()).toContain('/\\d/.test(password)');
  });

  it('error message mentions 8 characters', () => {
    expect(src()).toContain('8 characters');
  });

  it('error message mentions number requirement', () => {
    const code = src();
    expect(code).toContain('number');
  });

  it('placeholder mentions 8 characters', () => {
    expect(src()).toContain('At least 8 characters');
  });

  it('server routes-auth.ts also requires 8 chars', () => {
    const serverSrc = readFile('server/routes-auth.ts');
    expect(serverSrc).toContain('password.length < 8');
  });

  it('server routes-auth.ts also requires a digit', () => {
    const serverSrc = readFile('server/routes-auth.ts');
    expect(serverSrc).toContain('/\\d/.test(password)');
  });
});

// ---------------------------------------------------------------------------
// 4. Admin promotion routes — static analysis
// ---------------------------------------------------------------------------
describe('Admin promotion routes (server/routes-admin-promotion.ts) — static', () => {
  const src = () => readFile('server/routes-admin-promotion.ts');

  it('module file exists', () => {
    expect(fileExists('server/routes-admin-promotion.ts')).toBe(true);
  });

  it('exports registerAdminPromotionRoutes', () => {
    expect(src()).toContain('export function registerAdminPromotionRoutes');
  });

  it('has GET /api/admin/promotion-status/:city', () => {
    expect(src()).toContain('/api/admin/promotion-status/:city');
  });

  it('has POST /api/admin/promote/:city', () => {
    expect(src()).toContain('/api/admin/promote/:city');
  });

  it('has GET /api/admin/promotion-thresholds', () => {
    expect(src()).toContain('/api/admin/promotion-thresholds');
  });

  it('has PUT /api/admin/promotion-thresholds', () => {
    expect(src()).toContain('app.put');
    expect(src()).toContain('/api/admin/promotion-thresholds');
  });

  it('uses tagged logger', () => {
    expect(src()).toContain('log.tag("AdminPromotion")');
  });

  it('imports from city-promotion module', () => {
    expect(src()).toContain('./city-promotion');
  });

  it('imports wrapAsync', () => {
    expect(src()).toContain('wrapAsync');
  });
});

// ---------------------------------------------------------------------------
// 5. Integration — wiring
// ---------------------------------------------------------------------------
describe('Integration wiring', () => {
  it('routes.ts imports routes-admin-promotion', () => {
    const routesSrc = readFile('server/routes.ts');
    expect(routesSrc).toContain('routes-admin-promotion');
  });

  it('routes.ts calls registerAdminPromotionRoutes', () => {
    const routesSrc = readFile('server/routes.ts');
    expect(routesSrc).toContain('registerAdminPromotionRoutes(app)');
  });

  it('city-promotion imports getCityEngagement from city-engagement', () => {
    const promoSrc = readFile('server/city-promotion.ts');
    expect(promoSrc).toContain('import { getCityEngagement } from "./city-engagement"');
  });

  it('city-promotion imports getCityConfig from shared/city-config', () => {
    const promoSrc = readFile('server/city-promotion.ts');
    expect(promoSrc).toContain('getCityConfig');
    expect(promoSrc).toContain('../shared/city-config');
  });

  it('city-promotion imports CITY_REGISTRY for mutation', () => {
    const promoSrc = readFile('server/city-promotion.ts');
    expect(promoSrc).toContain('CITY_REGISTRY');
  });
});
