import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');

function fileExists(relPath: string): boolean {
  return existsSync(join(ROOT, relPath));
}

function readFile(relPath: string): string {
  return readFileSync(join(ROOT, relPath), 'utf-8');
}

describe('SLT-230 Meeting Doc', () => {
  const path = 'docs/sprints/SPRINT-230-SLT-MIDYEAR-AUDIT.md';

  it('file exists', () => {
    expect(fileExists(path)).toBe(true);
  });

  it('contains Mid-Year Review or SLT', () => {
    const content = readFile(path);
    expect(content).toMatch(/Mid-Year Review|SLT/i);
  });

  it('references Sprint 226-229', () => {
    const content = readFile(path);
    expect(content).toMatch(/226/);
    expect(content).toMatch(/229/);
  });

  it('references all key attendees', () => {
    const content = readFile(path);
    expect(content).toMatch(/Marcus Chen/);
    expect(content).toMatch(/Rachel Wei/);
    expect(content).toMatch(/Sarah Nakamura/);
  });

  it('contains department reports', () => {
    const content = readFile(path);
    expect(content).toMatch(/department|engineering|revenue|design|security|marketing/i);
  });

  it('contains roadmap 231-235', () => {
    const content = readFile(path);
    expect(content).toMatch(/231/);
    expect(content).toMatch(/235/);
  });

  it('references Memphis/Nashville expansion', () => {
    const content = readFile(path);
    expect(content).toMatch(/Memphis/);
    expect(content).toMatch(/Nashville/);
  });

  it('contains action items', () => {
    const content = readFile(path);
    expect(content).toMatch(/action item/i);
  });
});

describe('Arch Audit #28', () => {
  const path = 'docs/sprints/SPRINT-230-SLT-MIDYEAR-AUDIT.md';

  it('file exists', () => {
    expect(fileExists(path)).toBe(true);
  });

  it('grade is A', () => {
    const content = readFile(path);
    expect(content).toMatch(/Grade:\s*A\b/);
  });

  it('0 critical findings', () => {
    const content = readFile(path);
    expect(content).toMatch(/0\s*critical/i);
  });

  it('0 high findings', () => {
    const content = readFile(path);
    expect(content).toMatch(/0\s*high/i);
  });

  it('references email module directory', () => {
    const content = readFile(path);
    expect(content).toMatch(/email/i);
  });

  it('references in-memory stores', () => {
    const content = readFile(path);
    expect(content).toMatch(/in-memory|outreach history/i);
  });

  it('test count 4,222 or 4222', () => {
    const content = readFile(path);
    expect(content).toMatch(/4,?222/);
  });

  it('grade history has 5+ entries', () => {
    const content = readFile(path);
    const matches = content.match(/\| #\d+/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });

  it('references next audit Sprint 235', () => {
    const content = readFile(path);
    expect(content).toMatch(/next audit.*235|235.*next audit|Sprint 235/i);
  });
});

describe('Documentation completeness', () => {
  it('both sprint doc and retro exist', () => {
    expect(fileExists('docs/sprints/SPRINT-230-SLT-MIDYEAR-AUDIT.md')).toBe(true);
    expect(fileExists('docs/retros/RETRO-230-SLT-MIDYEAR-AUDIT.md')).toBe(true);
  });

  it('meeting references audit', () => {
    const content = readFile('docs/sprints/SPRINT-230-SLT-MIDYEAR-AUDIT.md');
    expect(content).toMatch(/Audit\s*#?28/i);
  });

  it('critique request exists', () => {
    expect(fileExists('docs/critique/inbox/SPRINT-225-229-REQUEST.md')).toBe(true);
  });
});
