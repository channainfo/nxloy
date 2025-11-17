import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../rbac.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard
 * Checks if user has required roles
 *
 * Usage:
 * @Roles('SUPER_ADMIN', 'BUSINESS_OWNER')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('admin')
 * adminOnly() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  /**
   * Check if user has required roles
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false; // No user authenticated
    }

    return this.rbacService.userHasAnyRole(user.userId, requiredRoles);
  }
}
