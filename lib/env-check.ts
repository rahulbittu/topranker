/**
 * Environment Validation Utility — Sprint 125
 * Checks for required and optional environment variables
 */

export interface EnvVar {
  name: string;
  required: boolean;
  present: boolean;
  masked?: string;
}

const ENV_DEFINITIONS: Array<{ name: string; required: boolean }> = [
  { name: "DATABASE_URL", required: true },
  { name: "SESSION_SECRET", required: true },
  { name: "GOOGLE_CLIENT_ID", required: false },
  { name: "EXPO_PUBLIC_GOOGLE_CLIENT_ID", required: false },
  { name: "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY", required: false },
  { name: "STRIPE_SECRET_KEY", required: false },
  { name: "RESEND_API_KEY", required: false },
];

function maskValue(value: string): string {
  if (value.length <= 4) {
    return value.charAt(0) + "***";
  }
  return value.substring(0, 4) + "***";
}

export function checkEnvironment(): EnvVar[] {
  return ENV_DEFINITIONS.map((def) => {
    const value = process.env[def.name];
    const present = !!value && value.length > 0;
    const result: EnvVar = {
      name: def.name,
      required: def.required,
      present,
    };
    if (present && value) {
      result.masked = maskValue(value);
    }
    return result;
  });
}

export function getEnvironmentSummary(): {
  total: number;
  present: number;
  missing: number;
  requiredMissing: string[];
} {
  const vars = checkEnvironment();
  const present = vars.filter((v) => v.present).length;
  const missing = vars.filter((v) => !v.present).length;
  const requiredMissing = vars
    .filter((v) => v.required && !v.present)
    .map((v) => v.name);

  return {
    total: vars.length,
    present,
    missing,
    requiredMissing,
  };
}
