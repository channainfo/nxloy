import {
  requireEnv,
  requireEnvInt,
  optionalEnv,
  optionalEnvInt,
} from './env.util';

describe('EnvUtil', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original env after all tests
    process.env = originalEnv;
  });

  describe('requireEnv', () => {
    it('should return value when environment variable exists', () => {
      process.env.TEST_VAR = 'test-value';

      const result = requireEnv('TEST_VAR');

      expect(result).toBe('test-value');
    });

    it('should throw error when environment variable is undefined', () => {
      delete process.env.TEST_VAR;

      expect(() => requireEnv('TEST_VAR')).toThrow(
        'TEST_VAR environment variable is required but not defined',
      );
    });

    it('should throw error when environment variable is empty string', () => {
      process.env.TEST_VAR = '';

      expect(() => requireEnv('TEST_VAR')).toThrow(
        'TEST_VAR environment variable is required but not defined',
      );
    });

    it('should throw error when environment variable is whitespace only', () => {
      process.env.TEST_VAR = '   ';

      expect(() => requireEnv('TEST_VAR')).toThrow(
        'TEST_VAR environment variable is required but not defined',
      );
    });

    it('should preserve leading/trailing spaces in non-empty values', () => {
      process.env.TEST_VAR = '  value  ';

      const result = requireEnv('TEST_VAR');

      expect(result).toBe('  value  ');
    });

    it('should handle special characters in values', () => {
      process.env.TEST_VAR = 'test@#$%^&*()_+-=[]{}|;:,.<>?/';

      const result = requireEnv('TEST_VAR');

      expect(result).toBe('test@#$%^&*()_+-=[]{}|;:,.<>?/');
    });
  });

  describe('requireEnvInt', () => {
    it('should return integer when environment variable is valid number', () => {
      process.env.TEST_PORT = '8080';

      const result = requireEnvInt('TEST_PORT');

      expect(result).toBe(8080);
    });

    it('should parse negative integers', () => {
      process.env.TEST_VAR = '-42';

      const result = requireEnvInt('TEST_VAR');

      expect(result).toBe(-42);
    });

    it('should parse zero', () => {
      process.env.TEST_VAR = '0';

      const result = requireEnvInt('TEST_VAR');

      expect(result).toBe(0);
    });

    it('should throw error when environment variable is undefined', () => {
      delete process.env.TEST_PORT;

      expect(() => requireEnvInt('TEST_PORT')).toThrow(
        'TEST_PORT environment variable is required but not defined',
      );
    });

    it('should throw error when environment variable is not a valid integer', () => {
      process.env.TEST_PORT = 'not-a-number';

      expect(() => requireEnvInt('TEST_PORT')).toThrow(
        'TEST_PORT must be a valid integer, got: "not-a-number"',
      );
    });

    it('should parse float as integer by truncating decimal part', () => {
      process.env.TEST_VAR = '3.14';

      const result = requireEnvInt('TEST_VAR');

      // parseInt truncates decimals, doesn't throw
      expect(result).toBe(3);
    });

    it('should throw error when environment variable is empty string', () => {
      process.env.TEST_PORT = '';

      expect(() => requireEnvInt('TEST_PORT')).toThrow(
        'TEST_PORT environment variable is required but not defined',
      );
    });

    it('should handle numeric strings with whitespace by parsing correctly', () => {
      process.env.TEST_VAR = '  123  ';

      const result = requireEnvInt('TEST_VAR');

      expect(result).toBe(123);
    });
  });

  describe('optionalEnv', () => {
    it('should return value when environment variable exists', () => {
      process.env.OPTIONAL_VAR = 'optional-value';

      const result = optionalEnv('OPTIONAL_VAR');

      expect(result).toBe('optional-value');
    });

    it('should return undefined when environment variable does not exist', () => {
      delete process.env.OPTIONAL_VAR;

      const result = optionalEnv('OPTIONAL_VAR');

      expect(result).toBeUndefined();
    });

    it('should return empty string when environment variable is empty', () => {
      process.env.OPTIONAL_VAR = '';

      const result = optionalEnv('OPTIONAL_VAR');

      expect(result).toBe('');
    });

    it('should preserve whitespace values', () => {
      process.env.OPTIONAL_VAR = '   ';

      const result = optionalEnv('OPTIONAL_VAR');

      expect(result).toBe('   ');
    });
  });

  describe('optionalEnvInt', () => {
    it('should return integer when environment variable is valid number', () => {
      process.env.OPTIONAL_PORT = '3000';

      const result = optionalEnvInt('OPTIONAL_PORT');

      expect(result).toBe(3000);
    });

    it('should return undefined when environment variable does not exist', () => {
      delete process.env.OPTIONAL_PORT;

      const result = optionalEnvInt('OPTIONAL_PORT');

      expect(result).toBeUndefined();
    });

    it('should return undefined when environment variable is empty string', () => {
      process.env.OPTIONAL_PORT = '';

      const result = optionalEnvInt('OPTIONAL_PORT');

      expect(result).toBeUndefined();
    });

    it('should throw error when environment variable is not a valid integer', () => {
      process.env.OPTIONAL_PORT = 'not-a-number';

      expect(() => optionalEnvInt('OPTIONAL_PORT')).toThrow(
        'OPTIONAL_PORT must be a valid integer if provided, got: "not-a-number"',
      );
    });

    it('should parse zero correctly', () => {
      process.env.OPTIONAL_VAR = '0';

      const result = optionalEnvInt('OPTIONAL_VAR');

      expect(result).toBe(0);
    });

    it('should parse negative integers', () => {
      process.env.OPTIONAL_VAR = '-999';

      const result = optionalEnvInt('OPTIONAL_VAR');

      expect(result).toBe(-999);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle rapid successive calls to same variable', () => {
      process.env.RAPID_VAR = 'value';

      const results = Array.from({ length: 100 }, () =>
        requireEnv('RAPID_VAR'),
      );

      expect(results).toHaveLength(100);
      expect(results.every((r) => r === 'value')).toBe(true);
    });

    it('should handle multiple different variables', () => {
      process.env.VAR_1 = 'value1';
      process.env.VAR_2 = '42';
      process.env.VAR_3 = 'value3';

      expect(requireEnv('VAR_1')).toBe('value1');
      expect(requireEnvInt('VAR_2')).toBe(42);
      expect(requireEnv('VAR_3')).toBe('value3');
    });

    it('should handle mix of required and optional variables', () => {
      process.env.REQUIRED_VAR = 'required';
      delete process.env.OPTIONAL_VAR;

      expect(requireEnv('REQUIRED_VAR')).toBe('required');
      expect(optionalEnv('OPTIONAL_VAR')).toBeUndefined();
    });
  });
});
