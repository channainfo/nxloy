import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../rbac.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * Permissions Guard
 * Checks if user has required permissions
 *
 * Usage:
 * @RequirePermissions('customers:read', 'customers:update')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Put('customers/:id')
 * updateCustomer() { ... }
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  /**
   * Check if user has required permissions
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false; // No user authenticated
    }

    const result = await this.rbacService.userHasAllPermissions(
      user.userId,
      requiredPermissions,
    );

    return result.allowed;
  }
}
