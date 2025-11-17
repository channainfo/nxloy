import { SetMetadata } from '@nestjs/common';

/**
 * Permissions Decorator
 * Marks endpoint as requiring specific permissions
 *
 * Usage:
 * @RequirePermissions('customers:read', 'customers:update')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Put('customers/:id')
 * updateCustomer() { ... }
 */
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
