import { describe, it, expect, beforeEach } from 'vitest';
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
// Email ID Mapping — server/email-id-mapping.ts (static)
// ---------------------------------------------------------------------------
describe('Email ID mapping module (server/email-id-mapping.ts)', () => {
  const src = () => readFile('server/email-id-mapping.ts');

  it('module exists', () => {
    expect(fileExists('server/email-id-mapping.ts')).toBe(true);
  });

  it('exports registerEmailMapping', () => {
    expect(src()).toContain('export function registerEmailMapping');
  });

  it('exports getTrackingIdFromResend', () => {
    expect(src()).toContain('export function getTrackingIdFromResend');
  });

  it('exports getResendIdFromTracking', () => {
    expect(src()).toContain('export function getResendIdFromTracking');
  });

  it('exports getMappingStats', () => {
    expect(src()).toContain('export function getMappingStats');
  });

  it('exports clearMappings', () => {
    expect(src()).toContain('export function clearMappings');
  });

  it('has max 2000 mappings (contains "2000")', () => {
    expect(src()).toContain('2000');
  });
});

// ---------------------------------------------------------------------------
// Email ID Mapping — runtime tests
// ---------------------------------------------------------------------------
describe('Email ID mapping runtime', () => {
  let registerEmailMapping: typeof import('../server/email-id-mapping').registerEmailMapping;
  let getTrackingIdFromResend: typeof import('../server/email-id-mapping').getTrackingIdFromResend;
  let getResendIdFromTracking: typeof import('../server/email-id-mapping').getResendIdFromTracking;
  let getMappingStats: typeof import('../server/email-id-mapping').getMappingStats;
  let clearMappings: typeof import('../server/email-id-mapping').clearMappings;

  beforeEach(async () => {
    const mod = await import('../server/email-id-mapping');
    registerEmailMapping = mod.registerEmailMapping;
    getTrackingIdFromResend = mod.getTrackingIdFromResend;
    getResendIdFromTracking = mod.getResendIdFromTracking;
    getMappingStats = mod.getMappingStats;
    clearMappings = mod.clearMappings;
    clearMappings();
  });

  it('registerEmailMapping stores a mapping', () => {
    registerEmailMapping('trk-001', 'resend-abc');
    const stats = getMappingStats();
    expect(stats.totalMappings).toBe(1);
  });

  it('getTrackingIdFromResend returns tracking ID', () => {
    registerEmailMapping('trk-002', 'resend-xyz');
    expect(getTrackingIdFromResend('resend-xyz')).toBe('trk-002');
  });

  it('getResendIdFromTracking returns Resend ID (reverse lookup)', () => {
    registerEmailMapping('trk-003', 'resend-999');
    expect(getResendIdFromTracking('trk-003')).toBe('resend-999');
  });

  it('clearMappings clears both maps', () => {
    registerEmailMapping('trk-a', 'resend-a');
    registerEmailMapping('trk-b', 'resend-b');
    clearMappings();
    const stats = getMappingStats();
    expect(stats.totalMappings).toBe(0);
    expect(getTrackingIdFromResend('resend-a')).toBeUndefined();
    expect(getResendIdFromTracking('trk-b')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Admin experiments — server/routes-admin-experiments.ts (static)
// ---------------------------------------------------------------------------
describe('Admin experiment routes (server/routes-admin-experiments.ts)', () => {
  const src = () => readFile('server/routes-admin-experiments.ts');

  it('module exists', () => {
    expect(fileExists('server/routes-admin-experiments.ts')).toBe(true);
  });

  it('exports registerAdminExperimentRoutes', () => {
    expect(src()).toContain('export function registerAdminExperimentRoutes');
  });

  it('has GET /api/admin/experiments endpoint', () => {
    expect(src()).toContain('/api/admin/experiments');
    expect(src()).toMatch(/app\.get\(\s*["']\/api\/admin\/experiments["']/);
  });

  it('has GET /api/admin/experiments/:id endpoint', () => {
    expect(src()).toContain('/api/admin/experiments/:id');
    expect(src()).toMatch(/app\.get\(\s*["']\/api\/admin\/experiments\/:id["']/);
  });

  it('has POST /api/admin/experiments endpoint', () => {
    expect(src()).toMatch(/app\.post\(\s*["']\/api\/admin\/experiments["']/);
  });

  it('has POST /api/admin/experiments/:id/complete endpoint', () => {
    expect(src()).toContain('/api/admin/experiments/:id/complete');
  });

  it('imports from email-ab-testing (contains "email-ab-testing")', () => {
    expect(src()).toContain('email-ab-testing');
  });

  it('imports from email-tracking (contains "email-tracking")', () => {
    expect(src()).toContain('email-tracking');
  });
});

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------
describe('Integration — wiring between routes, webhooks, and email-id-mapping', () => {
  it('routes.ts imports routes-admin-experiments', () => {
    const src = readFile('server/routes.ts');
    expect(src).toContain('routes-admin-experiments');
  });

  it('routes.ts registers registerAdminExperimentRoutes', () => {
    const src = readFile('server/routes.ts');
    expect(src).toContain('registerAdminExperimentRoutes');
  });

  it('routes-webhooks.ts imports getTrackingIdFromResend (contains "getTrackingIdFromResend")', () => {
    const src = readFile('server/routes-webhooks.ts');
    expect(src).toContain('getTrackingIdFromResend');
  });

  it('routes-webhooks.ts uses tracking ID resolution (contains "trackingId")', () => {
    const src = readFile('server/routes-webhooks.ts');
    expect(src).toContain('trackingId');
  });
});
