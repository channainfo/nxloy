/**
 * Security Event Types
 */
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

/**
 * Account Lockout Status
 */
export interface LockoutStatus {
  isLocked: boolean;
  lockedUntil?: Date;
  failedAttempts: number;
  remainingAttempts: number;
}

/**
 * Rate Limit Configuration
 */
export interface RateLimitConfig {
  ttl: number; // Time window in seconds
  limit: number; // Max requests in time window
}
