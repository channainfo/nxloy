import { RateLimit, RATE_LIMIT_KEY } from './rate-limit.decorator';
import { SetMetadata } from '@nestjs/common';

// Mock SetMetadata
jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn((key, value) => {
    return (target: any) => {
      target[key] = value;
      return target;
    };
  }),
}));

describe('RateLimit Decorator', () => {
  it('should be defined', () => {
    expect(RateLimit).toBeDefined();
  });

  it('should set metadata with correct key', () => {
    const config = { ttl: 60, limit: 5 };

    RateLimit(config);

    expect(SetMetadata).toHaveBeenCalledWith(RATE_LIMIT_KEY, config);
  });

  it('should accept custom TTL', () => {
    const config = { ttl: 120, limit: 10 };

    RateLimit(config);

    expect(SetMetadata).toHaveBeenCalledWith(RATE_LIMIT_KEY, config);
  });

  it('should accept custom limit', () => {
    const config = { ttl: 60, limit: 3 };

    RateLimit(config);

    expect(SetMetadata).toHaveBeenCalledWith(RATE_LIMIT_KEY, config);
  });

  it('should handle strict rate limiting', () => {
    const config = { ttl: 30, limit: 1 };

    RateLimit(config);

    expect(SetMetadata).toHaveBeenCalledWith(RATE_LIMIT_KEY, config);
  });

  it('should handle lenient rate limiting', () => {
    const config = { ttl: 3600, limit: 1000 };

    RateLimit(config);

    expect(SetMetadata).toHaveBeenCalledWith(RATE_LIMIT_KEY, config);
  });

  it('should have correct metadata key constant', () => {
    expect(RATE_LIMIT_KEY).toBe('rateLimit');
  });
});
