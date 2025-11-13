import * as bcrypt from 'bcrypt';

/**
 * Password Utility
 * Centralized password hashing and verification
 *
 * Standards:
 * - bcrypt algorithm
 * - 10 salt rounds (balanced security/performance)
 * - Consistent across all authentication flows
 *
 * Usage:
 * ```
 * const hash = await PasswordUtil.hash('plaintext');
 * const isValid = await PasswordUtil.verify('plaintext', hash);
 * ```
 */
export class PasswordUtil {
  /**
   * Number of bcrypt salt rounds
   * 10 rounds = ~150ms per hash (good balance)
   * Higher = more secure but slower
   */
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash a plaintext password
   *
   * @param plaintext Plain text password
   * @returns Hashed password
   */
  static async hash(plaintext: string): Promise<string> {
    if (!plaintext) {
      throw new Error('Password cannot be empty');
    }

    return bcrypt.hash(plaintext, this.SALT_ROUNDS);
  }

  /**
   * Verify a plaintext password against a hash
   *
   * @param plaintext Plain text password
   * @param hash Hashed password
   * @returns True if password matches
   */
  static async verify(plaintext: string, hash: string): Promise<boolean> {
    if (!plaintext || !hash) {
      return false;
    }

    return bcrypt.compare(plaintext, hash);
  }

  /**
   * Check if a string is already a bcrypt hash
   * Bcrypt hashes start with $2a$, $2b$, or $2y$
   *
   * @param str String to check
   * @returns True if string appears to be a bcrypt hash
   */
  static isHash(str: string): boolean {
    return /^\$2[aby]\$\d{2}\$/.test(str);
  }
}
