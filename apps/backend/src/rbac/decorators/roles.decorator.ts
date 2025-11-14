import { SetMetadata } from '@nestjs/common';

/**
 * Roles Decorator
 * Marks endpoint as requiring specific roles
 *
 * Usage:
 * @Roles('SUPER_ADMIN', 'BUSINESS_OWNER')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('admin')
 * adminOnly() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
