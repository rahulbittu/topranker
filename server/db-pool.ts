/**
 * Database Connection Pool Abstraction
 * Sprint 119 — evaluation layer for connection pooling
 * Actual pooling deferred until multi-instance deployment
 *
 * Author: Sarah Nakamura (Lead Eng)
 * Reviewed: Amir Patel (Architecture)
 */

export interface PoolConfig {
  maxConnections: number;
  idleTimeoutMs: number;
  acquireTimeoutMs: number;
}

export const DEFAULT_POOL_CONFIG: PoolConfig = {
  maxConnections: 10,
  idleTimeoutMs: 30000,
  acquireTimeoutMs: 5000,
};

export class ConnectionPool {
  private config: PoolConfig;
  private activeCount = 0;
  private idleCount = 0;
  private waitingCount = 0;
  private drained = false;

  constructor(config: PoolConfig) {
    this.config = config;
    this.idleCount = config.maxConnections;
  }

  getStats(): { active: number; idle: number; waiting: number; total: number } {
    return {
      active: this.activeCount,
      idle: this.idleCount,
      waiting: this.waitingCount,
      total: this.activeCount + this.idleCount,
    };
  }

  async drain(): Promise<void> {
    this.drained = true;
    this.activeCount = 0;
    this.idleCount = 0;
    this.waitingCount = 0;
  }

  isHealthy(): boolean {
    if (this.drained) return false;
    return this.activeCount < this.config.maxConnections;
  }
}

export function createPool(config?: Partial<PoolConfig>): ConnectionPool {
  const mergedConfig: PoolConfig = {
    ...DEFAULT_POOL_CONFIG,
    ...config,
  };
  return new ConnectionPool(mergedConfig);
}
