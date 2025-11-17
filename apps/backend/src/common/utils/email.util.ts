/**
 * Email Utility Functions
 * Provides email sanitization and normalization
 */

/**
 * Sanitize email address
 * - Trims whitespace
 * - Converts to lowercase
 * - Normalizes Unicode characters (NFKC)
 *
 * @param email Raw email address
 * @returns Sanitized email address
 *
 * @example
 * sanitizeEmail('  User@Example.com  ') // 'user@example.com'
 * sanitizeEmail('user＠example.com') // 'user@example.com' (full-width @ normalized)
 */
export function sanitizeEmail(email: string): string {
  if (!email) {
    return '';
  }

  return email
    .trim()
    .toLowerCase()
    .normalize('NFKC'); // Normalize Unicode (e.g., full-width chars to ASCII)
}
