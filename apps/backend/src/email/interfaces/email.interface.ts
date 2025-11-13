/**
 * Email Message Interface
 * Standard format for all outgoing emails
 */
export interface EmailMessage {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  context: Record<string, any>;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
}

/**
 * Email Template Types
 * Corresponds to Handlebars templates in templates/
 */
export enum EmailTemplate {
  // Authentication
  EMAIL_VERIFICATION = 'email-verification',
  PASSWORD_RESET = 'password-reset',
  WELCOME = 'welcome',

  // PIN Verification
  PIN_VERIFICATION = 'pin-verification',

  // Security
  PASSWORD_CHANGED = 'password-changed',
  TWO_FACTOR_ENABLED = 'two-factor-enabled',
  TWO_FACTOR_CODE = 'two-factor-code',

  // Account
  ACCOUNT_LOCKED = 'account-locked',
  LOGIN_ALERT = 'login-alert',
}

/**
 * Email Attachment
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

/**
 * Email Send Result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
