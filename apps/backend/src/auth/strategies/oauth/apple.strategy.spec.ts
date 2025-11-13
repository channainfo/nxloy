import { Test, TestingModule } from '@nestjs/testing';
import { AppleStrategy } from './apple.strategy';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

describe('AppleStrategy', () => {
  let strategy: AppleStrategy;
  const originalEnv = process.env;
  let tempKeyPath: string;

  beforeAll(() => {
    // Create temp directory and key file
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apple-test-'));
    tempKeyPath = path.join(tempDir, 'apple-key.p8');
    fs.writeFileSync(tempKeyPath, '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----');

    process.env = {
      ...originalEnv,
      APPLE_CLIENT_ID: 'test-client-id',
      APPLE_TEAM_ID: 'test-team-id',
      APPLE_KEY_ID: 'test-key-id',
      APPLE_PRIVATE_KEY_PATH: tempKeyPath,
      APPLE_CALLBACK_URL: 'http://localhost:3000/auth/apple/callback',
    };
  });

  afterAll(() => {
    // Cleanup temp file
    if (tempKeyPath && fs.existsSync(tempKeyPath)) {
      fs.unlinkSync(tempKeyPath);
      fs.rmdirSync(path.dirname(tempKeyPath));
    }
    process.env = originalEnv;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppleStrategy],
    }).compile();

    strategy = module.get<AppleStrategy>(AppleStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data from Apple profile', (done) => {
      const mockProfile = {
        id: 'apple-user-id-123',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
        email: 'john.doe@privaterelay.appleid.com',
      };

      const mockDone = (error: any, user: any) => {
        expect(error).toBeNull();
        expect(user).toEqual({
          provider: 'apple',
          providerId: 'apple-user-id-123',
          email: 'john.doe@privaterelay.appleid.com',
          firstName: 'John',
          lastName: 'Doe',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        });
        done();
      };

      strategy.validate(
        'access-token',
        'refresh-token',
        mockProfile,
        mockDone,
      );
    });

    it('should handle profile without name', (done) => {
      const mockProfile = {
        id: 'apple-user-id-456',
        email: 'jane.smith@privaterelay.appleid.com',
      };

      const mockDone = (error: any, user: any) => {
        expect(error).toBeNull();
        expect(user).toEqual({
          provider: 'apple',
          providerId: 'apple-user-id-456',
          email: 'jane.smith@privaterelay.appleid.com',
          firstName: null,
          lastName: null,
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        });
        done();
      };

      strategy.validate(
        'access-token',
        'refresh-token',
        mockProfile,
        mockDone,
      );
    });
  });

  describe('constructor', () => {
    it('should throw if APPLE_CLIENT_ID missing', () => {
      const savedEnv = { ...process.env };
      delete process.env.APPLE_CLIENT_ID;

      expect(() => new AppleStrategy()).toThrow();

      process.env = savedEnv;
    });

    it('should throw if APPLE_TEAM_ID missing', () => {
      const savedEnv = { ...process.env };
      delete process.env.APPLE_TEAM_ID;

      expect(() => new AppleStrategy()).toThrow();

      process.env = savedEnv;
    });

    it('should throw if APPLE_KEY_ID missing', () => {
      const savedEnv = { ...process.env };
      delete process.env.APPLE_KEY_ID;

      expect(() => new AppleStrategy()).toThrow();

      process.env = savedEnv;
    });

    it('should throw if APPLE_PRIVATE_KEY_PATH missing', () => {
      const savedEnv = { ...process.env };
      delete process.env.APPLE_PRIVATE_KEY_PATH;

      expect(() => new AppleStrategy()).toThrow();

      process.env = savedEnv;
    });

    it('should throw if APPLE_CALLBACK_URL missing', () => {
      const savedEnv = { ...process.env };
      delete process.env.APPLE_CALLBACK_URL;

      expect(() => new AppleStrategy()).toThrow();

      process.env = savedEnv;
    });

    it('should throw if private key file does not exist', () => {
      const savedEnv = { ...process.env };
      process.env.APPLE_PRIVATE_KEY_PATH = '/nonexistent/path/key.p8';

      expect(() => new AppleStrategy()).toThrow('Failed to read Apple private key');

      process.env = savedEnv;
    });
  });
});
