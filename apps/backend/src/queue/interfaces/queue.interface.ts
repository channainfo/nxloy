/**
 * Queue Names
 */
export enum QueueName {
  EMAIL = 'email',
  NOTIFICATIONS = 'notifications',
  ANALYTICS = 'analytics',
}

/**
 * Email Job Data
 */
export interface EmailJobData {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
}

/**
 * Job Result
 */
export interface JobResult {
  success: boolean;
  error?: string;
  data?: any;
}
