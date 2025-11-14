import { SetMetadata } from '@nestjs/common';

/**
 * Rate Limit Decorator
 * Applies custom rate limiting to specific endpoints
 *
 * Usage:
 * @RateLimit({ ttl: 60, limit: 5 })
 * @Post('login')
 * login() { ... }
 */
export const RATE_LIMIT_KEY = 'rateLimit';
export const RateLimit = (config: { ttl: number; limit: number }) =>
  SetMetadata(RATE_LIMIT_KEY, config);
