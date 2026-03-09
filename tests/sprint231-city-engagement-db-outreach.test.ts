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
// City engagement — server/city-engagement.ts
// ---------------------------------------------------------------------------
describe('City engagement module (server/city-engagement.ts)', () => {
  const src = () => readFile('server/city-engagement.ts');

  it('module exists', () => {
    expect(fileExists('server/city-engagement.ts')).toBe(true);
  });

  it('exports getCityEngagement', () => {
    expect(src()).toContain('getCityEngagement');
  });

  it('exports getAllCityEngagement', () => {
    expect(src()).toContain('getAllCityEngagement');
  });

  it('imports db from ./db', () => {
    expect(src()).toMatch(/from\s+['"]\.\/db['"]/);
  });

  it('imports members from schema (contains "members")', () => {
    expect(src()).toContain('members');
  });

  it('imports businesses from schema (contains "businesses")', () => {
    expect(src()).toContain('businesses');
  });

  it('has CityEngagement interface', () => {
    expect(src()).toContain('CityEngagement');
  });

  it('calculates avgRatingsPerMember', () => {
    expect(src()).toContain('avgRatingsPerMember');
  });
});

// ---------------------------------------------------------------------------
// DB-backed outreach history — server/outreach-history-db.ts
// ---------------------------------------------------------------------------
describe('DB-backed outreach history (server/outreach-history-db.ts)', () => {
  const src = () => readFile('server/outreach-history-db.ts');

  it('module exists', () => {
    expect(fileExists('server/outreach-history-db.ts')).toBe(true);
  });

  it('exports ensureOutreachHistoryTable', () => {
    expect(src()).toContain('ensureOutreachHistoryTable');
  });

  it('exports recordOutreachSentDb', () => {
    expect(src()).toContain('recordOutreachSentDb');
  });

  it('exports hasOutreachBeenSentDb', () => {
    expect(src()).toContain('hasOutreachBeenSentDb');
  });

  it('exports getOutreachHistoryDb', () => {
    expect(src()).toContain('getOutreachHistoryDb');
  });

  it('creates outreach_history table', () => {
    expect(src()).toContain('outreach_history');
  });

  it('creates index (contains "CREATE INDEX" or "idx_")', () => {
    const content = src();
    expect(content.includes('CREATE INDEX') || content.includes('idx_')).toBe(true);
  });

  it('uses date interval for dedup (contains "interval" or "withinDays")', () => {
    const content = src();
    expect(content.includes('interval') || content.includes('withinDays')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Admin endpoint wiring — server/routes-admin.ts
// ---------------------------------------------------------------------------
describe('Admin endpoint wiring (server/routes-admin.ts)', () => {
  const src = () => readFile('server/routes-admin.ts');

  it('imports getCityEngagement', () => {
    expect(src()).toContain('getCityEngagement');
  });

  it('imports getAllCityEngagement', () => {
    expect(src()).toContain('getAllCityEngagement');
  });

  it('has /api/admin/city-engagement endpoint', () => {
    expect(src()).toMatch(/\/api\/admin\/city-engagement/);
  });

  it('supports city query parameter (contains "req.query.city")', () => {
    expect(src()).toContain('req.query.city');
  });
});

// ---------------------------------------------------------------------------
// Integration
// ---------------------------------------------------------------------------
describe('Integration checks', () => {
  it('city-engagement.ts imports from city-config', () => {
    const content = readFile('server/city-engagement.ts');
    expect(content).toContain('city-config');
  });

  it('outreach-history-db.ts uses raw SQL (contains "sql" or "execute")', () => {
    const content = readFile('server/outreach-history-db.ts');
    expect(content.includes('sql') || content.includes('execute')).toBe(true);
  });
});
