/**
 * MFA Method Types
 */
export enum MfaMethod {
  TOTP = 'TOTP', // Authenticator app (Google Authenticator, Authy, etc.)
  SMS = 'SMS', // SMS code
  EMAIL = 'EMAIL', // Email code
  BACKUP_CODE = 'BACKUP_CODE', // One-time backup codes
}

/**
 * TOTP Setup Response
 */
export interface TotpSetupResponse {
  secret: string; // Base32 secret for manual entry
  qrCodeUrl: string; // Data URL for QR code image
  backupCodes: string[]; // 10 backup codes
}

/**
 * MFA Verification Result
 */
export interface MfaVerificationResult {
  success: boolean;
  method?: MfaMethod;
  error?: string;
}
