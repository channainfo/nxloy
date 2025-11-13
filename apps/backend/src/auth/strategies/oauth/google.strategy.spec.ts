import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      GOOGLE_CLIENT_ID: 'test-client-id',
      GOOGLE_CLIENT_SECRET: 'test-client-secret',
      GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleStrategy],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data from Google profile', async () => {
      const mockProfile = {
        id: 'google-user-id-123',
        name: {
          givenName: 'John',
          familyName: 'Doe',
        },
        emails: [{ value: 'john.doe@gmail.com' }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
      };

      const mockDone = jest.fn();

      await strategy.validate(
        'access-token',
        'refresh-token',
        mockProfile,
        mockDone,
      );

      expect(mockDone).toHaveBeenCalledWith(null, {
        provider: 'google',
        providerId: 'google-user-id-123',
        email: 'john.doe@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'https://example.com/photo.jpg',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should handle profile without photo', async () => {
      const mockProfile = {
        id: 'google-user-id-456',
        name: {
          givenName: 'Jane',
          familyName: 'Smith',
        },
        emails: [{ value: 'jane.smith@gmail.com' }],
        photos: [],
      };

      const mockDone = jest.fn();

      await strategy.validate(
        'access-token',
        'refresh-token',
        mockProfile,
        mockDone,
      );

      expect(mockDone).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          provider: 'google',
          providerId: 'google-user-id-456',
          email: 'jane.smith@gmail.com',
          firstName: 'Jane',
          lastName: 'Smith',
          picture: undefined,
        }),
      );
    });
  });

  describe('constructor', () => {
    it('should throw if GOOGLE_CLIENT_ID missing', () => {
      const { GOOGLE_CLIENT_ID, ...envWithoutClientId } = process.env;
      process.env = envWithoutClientId;

      expect(() => new GoogleStrategy()).toThrow();

      process.env = originalEnv;
    });

    it('should throw if GOOGLE_CLIENT_SECRET missing', () => {
      const { GOOGLE_CLIENT_SECRET, ...envWithoutSecret } = process.env;
      process.env = envWithoutSecret;

      expect(() => new GoogleStrategy()).toThrow();

      process.env = originalEnv;
    });

    it('should throw if GOOGLE_CALLBACK_URL missing', () => {
      const { GOOGLE_CALLBACK_URL, ...envWithoutCallback } = process.env;
      process.env = envWithoutCallback;

      expect(() => new GoogleStrategy()).toThrow();

      process.env = originalEnv;
    });
  });
});
