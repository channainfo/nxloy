/**
 * System Roles
 * Predefined roles that cannot be deleted
 */
export enum SystemRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  BUSINESS_MANAGER = 'BUSINESS_MANAGER',
  CUSTOMER = 'CUSTOMER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
}

/**
 * Permission Resource Types
 */
export enum PermissionResource {
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  CUSTOMERS = 'customers',
  LOYALTY_PROGRAMS = 'loyalty_programs',
  REWARDS = 'rewards',
  TRANSACTIONS = 'transactions',
  PARTNERS = 'partners',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
}

/**
 * Permission Actions
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'publish',
  MANAGE = 'manage', // Full control
}

/**
 * Permission Check Result
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}
