/**
 * Feature Flags Foundation — Sprint 120
 * In-memory feature flag system for gradual rollouts
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  createdAt: number;
}

const flagStore = new Map<string, FeatureFlag>();

// Pre-register default flags
const defaultFlags: Array<{ name: string; enabled: boolean; description: string }> = [
  { name: "dark_mode", enabled: true, description: "Dark mode theme support" },
  { name: "i18n", enabled: false, description: "Internationalization support" },
  { name: "offline_sync", enabled: false, description: "Offline data synchronization" },
  { name: "social_sharing", enabled: false, description: "Social sharing integration" },
];

for (const flag of defaultFlags) {
  flagStore.set(flag.name, {
    name: flag.name,
    enabled: flag.enabled,
    description: flag.description,
    createdAt: Date.now(),
  });
}

export function isFeatureEnabled(name: string): boolean {
  const flag = flagStore.get(name);
  return flag ? flag.enabled : false;
}

export function setFeatureFlag(name: string, enabled: boolean, description?: string): void {
  const existing = flagStore.get(name);
  if (existing) {
    existing.enabled = enabled;
    if (description !== undefined) {
      existing.description = description;
    }
  } else {
    flagStore.set(name, {
      name,
      enabled,
      description: description || "",
      createdAt: Date.now(),
    });
  }
}

export function getAllFlags(): FeatureFlag[] {
  return Array.from(flagStore.values());
}

export function removeFlag(name: string): boolean {
  return flagStore.delete(name);
}
