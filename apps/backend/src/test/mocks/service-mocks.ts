/**
 * Shared Test Mocks
 * Reusable mock providers for NestJS testing
 *
 * Usage:
 * ```typescript
 * const module = await Test.createTestingModule({
 *   providers: [MyService, ...getAuthTestProviders()]
 * }).compile();
 * ```
 */

// Email Service Mock
export const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendTemplateEmail: jest.fn().mockResolvedValue({ success: true }),
  sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
  sendTwoFactorCode: jest.fn().mockResolvedValue({ success: true }),
};

// Queue Service Mock
export const mockQueueService = {
  queueEmail: jest.fn().mockResolvedValue(undefined),
  scheduleEmail: jest.fn().mockResolvedValue(undefined),
};

// Audit Service Mock
export const mockAuditService = {
  log: jest.fn().mockResolvedValue(undefined),
  getUserLogs: jest.fn().mockResolvedValue([]),
};

// Security Service Mock
export const mockSecurityService = {
  checkLockoutStatus: jest.fn().mockResolvedValue({ isLocked: false }),
  recordLoginAttempt: jest.fn().mockResolvedValue(undefined),
  resetLoginAttempts: jest.fn().mockResolvedValue(undefined),
};

// JWT Service Mock
export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
  signAsync: jest.fn().mockResolvedValue('mock-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-id', email: 'test@example.com' }),
  verifyAsync: jest.fn().mockResolvedValue({ userId: 'test-id', email: 'test@example.com' }),
};

// Verification Service Mock
export const mockVerificationService = {
  requestPin: jest.fn().mockResolvedValue({ success: true }),
  verifyPin: jest.fn().mockResolvedValue({ success: true, token: 'mock-token' }),
  verifyToken: jest.fn().mockResolvedValue({ success: true }),
  sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
};

/**
 * Get standard test providers for authentication tests
 * Includes: JwtService, QueueService, SecurityService, AuditService, VerificationService
 */
export function getAuthTestProviders() {
  return [
    { provide: 'JwtService', useValue: mockJwtService },
    { provide: 'QueueService', useValue: mockQueueService },
    { provide: 'SecurityService', useValue: mockSecurityService },
    { provide: 'AuditService', useValue: mockAuditService },
    { provide: 'VerificationService', useValue: mockVerificationService },
  ];
}

/**
 * Get email-dependent test providers
 * Includes: EmailService
 */
export function getEmailTestProviders() {
  return [{ provide: 'EmailService', useValue: mockEmailService }];
}

/**
 * Reset all mocks (call in afterEach)
 */
export function resetAllMocks() {
  jest.clearAllMocks();
}
