import { Test, TestingModule } from '@nestjs/testing';
import { FacebookStrategy } from './facebook.strategy';

describe('FacebookStrategy', () => {
  let strategy: FacebookStrategy;
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      FACEBOOK_APP_ID: 'test-app-id',
      FACEBOOK_APP_SECRET: 'test-app-secret',
      FACEBOOK_CALLBACK_URL: 'http://localhost:3000/auth/facebook/callback',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacebookStrategy],
    }).compile();

    strategy = module.get<FacebookStrategy>(FacebookStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data from Facebook profile', async () => {
      const mockProfile = {
        id: 'facebook-user-id-123',
        name: {
          givenName: 'John',
          familyName: 'Doe',
        },
        emails: [{ value: 'john.doe@facebook.com' }],
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
        provider: 'facebook',
        providerId: 'facebook-user-id-123',
        email: 'john.doe@facebook.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'https://example.com/photo.jpg',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should handle profile without photo', async () => {
      const mockProfile = {
        id: 'facebook-user-id-456',
        name: {
          givenName: 'Jane',
          familyName: 'Smith',
        },
        emails: [{ value: 'jane.smith@facebook.com' }],
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
          provider: 'facebook',
          providerId: 'facebook-user-id-456',
          email: 'jane.smith@facebook.com',
          firstName: 'Jane',
          lastName: 'Smith',
          picture: undefined,
        }),
      );
    });
  });

  describe('constructor', () => {
    it('should throw if FACEBOOK_APP_ID missing', () => {
      const { FACEBOOK_APP_ID, ...envWithoutAppId } = process.env;
      process.env = envWithoutAppId;

      expect(() => new FacebookStrategy()).toThrow();

      process.env = originalEnv;
    });

    it('should throw if FACEBOOK_APP_SECRET missing', () => {
      const { FACEBOOK_APP_SECRET, ...envWithoutSecret } = process.env;
      process.env = envWithoutSecret;

      expect(() => new FacebookStrategy()).toThrow();

      process.env = originalEnv;
    });

    it('should throw if FACEBOOK_CALLBACK_URL missing', () => {
      const { FACEBOOK_CALLBACK_URL, ...envWithoutCallback } = process.env;
      process.env = envWithoutCallback;

      expect(() => new FacebookStrategy()).toThrow();

      process.env = originalEnv;
    });
  });
});
