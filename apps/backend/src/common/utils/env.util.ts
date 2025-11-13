/**
 * Environment Variable Utilities
 * Centralized environment variable validation
 *
 * Standards (CLAUDE.md):
 * - NEVER use fallback defaults (|| 'defaultValue')
 * - Fail fast when required env vars are missing
 * - No environment-specific code - same behavior in dev/prod
 *
 * Usage:
 * ```typescript
 * const port = requireEnvInt('PORT');
 * const apiKey = requireEnv('API_KEY');
 * const url = requireEnv('DATABASE_URL');
 * ```
 */

/**
 * Require string environment variable
 * Throws error if undefined or empty
 *
 * @param key Environment variable name
 * @returns Environment variable value
 * @throws Error if variable is undefined or empty
 */
export function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    throw new Error(
      `${key} environment variable is required but not defined. ` +
      `Please set it in your .env file or environment.`
    );
  }

  return value;
}

/**
 * Require integer environment variable
 * Throws error if undefined, empty, or not a valid integer
 *
 * @param key Environment variable name
 * @returns Parsed integer value
 * @throws Error if variable is undefined, empty, or not a valid integer
 */
export function requireEnvInt(key: string): number {
  const value = requireEnv(key);
  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new Error(
      `${key} must be a valid integer, got: "${value}"`
    );
  }

  return parsed;
}

/**
 * Get optional string environment variable
 * Returns undefined if not set (use when truly optional)
 *
 * @param key Environment variable name
 * @returns Environment variable value or undefined
 */
export function optionalEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Get optional integer environment variable
 * Returns undefined if not set (use when truly optional)
 *
 * @param key Environment variable name
 * @returns Parsed integer value or undefined
 */
export function optionalEnvInt(key: string): number | undefined {
  const value = process.env[key];

  if (!value) {
    return undefined;
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new Error(
      `${key} must be a valid integer if provided, got: "${value}"`
    );
  }

  return parsed;
}
