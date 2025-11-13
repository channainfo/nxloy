import { Module, OnModuleInit } from '@nestjs/common';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

/**
 * RBAC Module
 * Handles Role-Based Access Control
 *
 * Features:
 * - Role management (create, update, delete)
 * - Permission management
 * - User role assignment
 * - Permission checking
 * - System roles initialization
 *
 * System Roles:
 * - SUPER_ADMIN - Full system access
 * - BUSINESS_OWNER - Full business access
 * - BUSINESS_MANAGER - Limited business access
 * - CUSTOMER - Standard customer
 * - SUPPORT_AGENT - Customer support
 *
 * Guards:
 * - RolesGuard - Check user roles
 * - PermissionsGuard - Check user permissions
 */
@Module({
  controllers: [RbacController],
  providers: [RbacService, RolesGuard, PermissionsGuard],
  exports: [RbacService, RolesGuard, PermissionsGuard],
})
export class RbacModule implements OnModuleInit {
  constructor(private rbacService: RbacService) {}

  /**
   * Initialize system roles on module startup
   */
  async onModuleInit() {
    await this.rbacService.initializeSystemRoles();
  }
}
