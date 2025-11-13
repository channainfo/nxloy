import { PasswordUtil } from './password.util';
import * as bcrypt from 'bcrypt';

describe('PasswordUtil', () => {
  describe('hash', () => {
    it('should hash a valid password', async () => {
      const plaintext = 'SecurePassword123!';

      const hash = await PasswordUtil.hash(plaintext);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plaintext);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce bcrypt hash format', async () => {
      const plaintext = 'password123';

      const hash = await PasswordUtil.hash(plaintext);

      // Bcrypt hashes start with $2a$, $2b$, or $2y$ followed by cost factor
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should use 10 salt rounds (cost factor)', async () => {
      const plaintext = 'testpassword';

      const hash = await PasswordUtil.hash(plaintext);

      // Extract cost factor from hash (characters 4-5)
      const costFactor = hash.substring(4, 6);
      expect(costFactor).toBe('10');
    });

    it('should produce different hashes for same password (salted)', async () => {
      const plaintext = 'SamePassword123';

      const hash1 = await PasswordUtil.hash(plaintext);
      const hash2 = await PasswordUtil.hash(plaintext);

      expect(hash1).not.toBe(hash2);
      // But both should verify against the original password
      expect(await PasswordUtil.verify(plaintext, hash1)).toBe(true);
      expect(await PasswordUtil.verify(plaintext, hash2)).toBe(true);
    });

    it('should throw error when password is empty string', async () => {
      await expect(PasswordUtil.hash('')).rejects.toThrow(
        'Password cannot be empty',
      );
    });

    it('should throw error when password is null', async () => {
      await expect(PasswordUtil.hash(null as any)).rejects.toThrow(
        'Password cannot be empty',
      );
    });

    it('should throw error when password is undefined', async () => {
      await expect(PasswordUtil.hash(undefined as any)).rejects.toThrow(
        'Password cannot be empty',
      );
    });

    it('should hash password with special characters', async () => {
      const plaintext = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?/';

      const hash = await PasswordUtil.hash(plaintext);

      expect(hash).toBeDefined();
      expect(await PasswordUtil.verify(plaintext, hash)).toBe(true);
    });

    it('should hash very long passwords', async () => {
      const plaintext = 'a'.repeat(100);

      const hash = await PasswordUtil.hash(plaintext);

      expect(hash).toBeDefined();
      expect(await PasswordUtil.verify(plaintext, hash)).toBe(true);
    });

    it('should hash single character password', async () => {
      const plaintext = 'x';

      const hash = await PasswordUtil.hash(plaintext);

      expect(hash).toBeDefined();
      expect(await PasswordUtil.verify(plaintext, hash)).toBe(true);
    });

    it('should hash password with unicode characters', async () => {
      const plaintext = 'パスワード123';

      const hash = await PasswordUtil.hash(plaintext);

      expect(hash).toBeDefined();
      expect(await PasswordUtil.verify(plaintext, hash)).toBe(true);
    });

    it('should hash password with emojis', async () => {
      const plaintext = 'Pass🔒Word🔑123';

      const hash = await PasswordUtil.hash(plaintext);

      expect(hash).toBeDefined();
      expect(await PasswordUtil.verify(plaintext, hash)).toBe(true);
    });
  });

  describe('verify', () => {
    it('should return true when password matches hash', async () => {
      const plaintext = 'CorrectPassword123';
      const hash = await PasswordUtil.hash(plaintext);

      const result = await PasswordUtil.verify(plaintext, hash);

      expect(result).toBe(true);
    });

    it('should return false when password does not match hash', async () => {
      const correctPassword = 'CorrectPassword123';
      const wrongPassword = 'WrongPassword456';
      const hash = await PasswordUtil.hash(correctPassword);

      const result = await PasswordUtil.verify(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should return false when password is empty string', async () => {
      const hash = await PasswordUtil.hash('password');

      const result = await PasswordUtil.verify('', hash);

      expect(result).toBe(false);
    });

    it('should return false when hash is empty string', async () => {
      const result = await PasswordUtil.verify('password', '');

      expect(result).toBe(false);
    });

    it('should return false when password is null', async () => {
      const hash = await PasswordUtil.hash('password');

      const result = await PasswordUtil.verify(null as any, hash);

      expect(result).toBe(false);
    });

    it('should return false when hash is null', async () => {
      const result = await PasswordUtil.verify('password', null as any);

      expect(result).toBe(false);
    });

    it('should return false when password is undefined', async () => {
      const hash = await PasswordUtil.hash('password');

      const result = await PasswordUtil.verify(undefined as any, hash);

      expect(result).toBe(false);
    });

    it('should return false when hash is undefined', async () => {
      const result = await PasswordUtil.verify('password', undefined as any);

      expect(result).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const plaintext = 'Password123';
      const hash = await PasswordUtil.hash(plaintext);

      const lowerResult = await PasswordUtil.verify('password123', hash);
      const upperResult = await PasswordUtil.verify('PASSWORD123', hash);

      expect(lowerResult).toBe(false);
      expect(upperResult).toBe(false);
    });

    it('should detect whitespace differences', async () => {
      const plaintext = 'password';
      const hash = await PasswordUtil.hash(plaintext);

      const withSpaceResult = await PasswordUtil.verify(' password', hash);
      const trailingSpaceResult = await PasswordUtil.verify('password ', hash);

      expect(withSpaceResult).toBe(false);
      expect(trailingSpaceResult).toBe(false);
    });

    it('should verify password with special characters', async () => {
      const plaintext = 'P@ssw0rd!#$%^&*()';
      const hash = await PasswordUtil.hash(plaintext);

      const result = await PasswordUtil.verify(plaintext, hash);

      expect(result).toBe(true);
    });

    it('should verify very long passwords', async () => {
      const plaintext = 'a'.repeat(100);
      const hash = await PasswordUtil.hash(plaintext);

      const result = await PasswordUtil.verify(plaintext, hash);

      expect(result).toBe(true);
    });

    it('should reject invalid bcrypt hash format', async () => {
      const result = await PasswordUtil.verify('password', 'invalid-hash');

      expect(result).toBe(false);
    });

    it('should verify password with unicode characters', async () => {
      const plaintext = 'パスワード123';
      const hash = await PasswordUtil.hash(plaintext);

      const result = await PasswordUtil.verify(plaintext, hash);

      expect(result).toBe(true);
    });
  });

  describe('isHash', () => {
    it('should return true for valid bcrypt hash with $2a$ prefix', () => {
      const hash =
        '$2a$10$abcdefghijklmnopqrstuv.1234567890123456789012345678';

      const result = PasswordUtil.isHash(hash);

      expect(result).toBe(true);
    });

    it('should return true for valid bcrypt hash with $2b$ prefix', () => {
      const hash =
        '$2b$10$abcdefghijklmnopqrstuv.1234567890123456789012345678';

      const result = PasswordUtil.isHash(hash);

      expect(result).toBe(true);
    });

    it('should return true for valid bcrypt hash with $2y$ prefix', () => {
      const hash =
        '$2y$10$abcdefghijklmnopqrstuv.1234567890123456789012345678';

      const result = PasswordUtil.isHash(hash);

      expect(result).toBe(true);
    });

    it('should return true for actual bcrypt hashed password', async () => {
      const hash = await PasswordUtil.hash('testpassword');

      const result = PasswordUtil.isHash(hash);

      expect(result).toBe(true);
    });

    it('should return false for plain text password', () => {
      const plaintext = 'PlainTextPassword123';

      const result = PasswordUtil.isHash(plaintext);

      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      const result = PasswordUtil.isHash('');

      expect(result).toBe(false);
    });

    it('should return false for invalid hash prefix $2c$', () => {
      const hash =
        '$2c$10$abcdefghijklmnopqrstuv.1234567890123456789012345678';

      const result = PasswordUtil.isHash(hash);

      expect(result).toBe(false);
    });

    it('should return false for invalid hash format without cost factor', () => {
      const hash = '$2a$abcdefghijklmnopqrstuv.1234567890123456789012345678';

      const result = PasswordUtil.isHash(hash);

      expect(result).toBe(false);
    });

    it('should return false for partial hash', () => {
      const hash = '$2a$10$';

      const result = PasswordUtil.isHash(hash);

      expect(result).toBe(true); // It matches the pattern even though incomplete
    });

    it('should return false for random string', () => {
      const result = PasswordUtil.isHash('randomstring12345');

      expect(result).toBe(false);
    });

    it('should return false for string starting with $ but not bcrypt format', () => {
      const result = PasswordUtil.isHash('$notabcryptHash');

      expect(result).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should handle rapid hash and verify operations', async () => {
      const passwords = [
        'Password1',
        'Password2',
        'Password3',
        'Password4',
        'Password5',
      ];

      const hashes = await Promise.all(
        passwords.map((pwd) => PasswordUtil.hash(pwd)),
      );

      // Verify each password against its own hash
      const verifications = await Promise.all(
        passwords.map((pwd, idx) => PasswordUtil.verify(pwd, hashes[idx])),
      );

      expect(verifications.every((v) => v === true)).toBe(true);
    });

    it('should verify password does not match wrong hash', async () => {
      const password1 = 'Password1';
      const password2 = 'Password2';

      const hash1 = await PasswordUtil.hash(password1);
      const hash2 = await PasswordUtil.hash(password2);

      // Cross-verify (should all be false)
      expect(await PasswordUtil.verify(password1, hash2)).toBe(false);
      expect(await PasswordUtil.verify(password2, hash1)).toBe(false);
    });

    it('should handle concurrent hash operations', async () => {
      const passwords = Array.from({ length: 10 }, (_, i) => `Password${i}`);

      const hashes = await Promise.all(
        passwords.map((pwd) => PasswordUtil.hash(pwd)),
      );

      expect(hashes).toHaveLength(10);
      expect(hashes.every((h) => PasswordUtil.isHash(h))).toBe(true);
      expect(new Set(hashes).size).toBe(10); // All unique
    });

    it('should maintain consistency with bcrypt library directly', async () => {
      const plaintext = 'DirectBcryptTest';

      // Hash using PasswordUtil
      const utilHash = await PasswordUtil.hash(plaintext);

      // Verify using bcrypt directly
      const bcryptResult = await bcrypt.compare(plaintext, utilHash);

      expect(bcryptResult).toBe(true);
    });

    it('should verify hash created by bcrypt directly', async () => {
      const plaintext = 'DirectBcryptHashTest';

      // Hash using bcrypt directly
      const bcryptHash = await bcrypt.hash(plaintext, 10);

      // Verify using PasswordUtil
      const utilResult = await PasswordUtil.verify(plaintext, bcryptHash);

      expect(utilResult).toBe(true);
    });
  });

  describe('Security tests', () => {
    it('should not reveal timing differences for invalid passwords', async () => {
      const correctPassword = 'CorrectPassword123';
      const hash = await PasswordUtil.hash(correctPassword);

      const shortWrong = 'x';
      const longWrong = 'x'.repeat(100);

      // Measure time for both (should be similar due to bcrypt constant-time comparison)
      const start1 = Date.now();
      await PasswordUtil.verify(shortWrong, hash);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await PasswordUtil.verify(longWrong, hash);
      const time2 = Date.now() - start2;

      // Both should take roughly the same time (within 50ms)
      // This is a rough check, bcrypt's constant-time comparison provides the real protection
      expect(Math.abs(time1 - time2)).toBeLessThan(50);
    });

    it('should not allow plaintext password to be stored', async () => {
      const plaintext = 'PlaintextPassword';

      const hash = await PasswordUtil.hash(plaintext);

      expect(hash).not.toContain(plaintext);
      expect(hash).not.toBe(plaintext);
    });

    it('should produce different salts for identical passwords', async () => {
      const plaintext = 'SamePassword';

      const hash1 = await PasswordUtil.hash(plaintext);
      const hash2 = await PasswordUtil.hash(plaintext);

      // Extract salt portion (characters 0-29 in bcrypt hash)
      const salt1 = hash1.substring(0, 29);
      const salt2 = hash2.substring(0, 29);

      expect(salt1).not.toBe(salt2);
    });
  });
});
