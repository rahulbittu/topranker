/**
 * Database Migration Runner
 * Tracks and applies schema migrations with rollback support.
 * Sprint 124
 */

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
  appliedAt?: number;
}

/** Migration registry — add migrations here as the schema evolves */
export const migrations: Migration[] = [];

/** In-memory tracking of applied migration IDs */
const appliedMigrations = new Set<string>();

/**
 * Returns the current migration status: which are applied and which are pending.
 */
export function getMigrationStatus(): {
  applied: string[];
  pending: string[];
} {
  const applied = migrations
    .filter((m) => appliedMigrations.has(m.id))
    .map((m) => m.id);
  const pending = migrations
    .filter((m) => !appliedMigrations.has(m.id))
    .map((m) => m.id);
  return { applied, pending };
}

/**
 * Apply a single migration by ID.
 */
export function applyMigration(
  id: string
): { success: boolean; error?: string } {
  const migration = migrations.find((m) => m.id === id);
  if (!migration) {
    return { success: false, error: `Migration ${id} not found` };
  }
  if (appliedMigrations.has(id)) {
    return { success: false, error: `Migration ${id} already applied` };
  }
  try {
    // In production, execute migration.up against the database
    appliedMigrations.add(id);
    migration.appliedAt = Date.now();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Rollback a single migration by ID.
 */
export function rollbackMigration(
  id: string
): { success: boolean; error?: string } {
  const migration = migrations.find((m) => m.id === id);
  if (!migration) {
    return { success: false, error: `Migration ${id} not found` };
  }
  if (!appliedMigrations.has(id)) {
    return { success: false, error: `Migration ${id} is not applied` };
  }
  try {
    // In production, execute migration.down against the database
    appliedMigrations.delete(id);
    migration.appliedAt = undefined;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
