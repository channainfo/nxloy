import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import {
  SystemRole,
  PermissionCheckResult,
} from './interfaces/rbac.interface';

/**
 * RBAC Service
 * Handles Role-Based Access Control:
 * - Role management (create, update, delete)
 * - Permission management
 * - User role assignment
 * - Permission checking
 *
 * Standards (CLAUDE.md):
 * - Max 40 lines per method
 * - Max 3 parameters
 */
@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);
  private readonly prisma: PrismaClient;

  constructor(@Optional() @Inject(PrismaClient) prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Create new role
   *
   * @param dto Role creation data
   * @returns Created role
   */
  async createRole(dto: CreateRoleDto) {
    const existing = await this.findRoleByName(dto.name);

    if (existing) {
      throw new BadRequestException('Role already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        isSystem: dto.isSystem || false,
      },
    });

    if (dto.permissionIds && dto.permissionIds.length > 0) {
      await this.assignPermissionsToRole(role.id, dto.permissionIds);
    }

    this.logger.log(`Role created: ${role.name}`);

    return role;
  }

  /**
   * Get all roles
   */
  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    return role;
  }

  /**
   * Delete role
   * Cannot delete system roles
   */
  async deleteRole(roleId: string) {
    const role = await this.getRoleById(roleId);

    if (role.isSystem) {
      throw new ForbiddenException('Cannot delete system role');
    }

    await this.prisma.role.delete({
      where: { id: roleId },
    });

    this.logger.log(`Role deleted: ${role.name}`);

    return { success: true };
  }

  /**
   * Assign role to user
   *
   * @param userId User ID
   * @param dto Role assignment data
   * @param grantedBy ID of user granting the role
   */
  async assignRoleToUser(userId: string, dto: AssignRoleDto, grantedBy?: string) {
    const user = await this.getUser(userId);
    const role = await this.getRoleById(dto.roleId);

    const userRole = await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        scopeType: dto.scopeType,
        scopeId: dto.scopeId,
        grantedBy,
      },
    });

    this.logger.log(`Role ${role.name} assigned to user ${userId}`);

    return userRole;
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleId: string) {
    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });

    this.logger.log(`Role removed from user ${userId}`);

    return { success: true };
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Check if user has role
   */
  async userHasRole(userId: string, roleName: string): Promise<boolean> {
    const count = await this.prisma.userRole.count({
      where: {
        userId,
        role: {
          name: roleName,
        },
      },
    });

    return count > 0;
  }

  /**
   * Check if user has any of the specified roles
   */
  async userHasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    const count = await this.prisma.userRole.count({
      where: {
        userId,
        role: {
          name: {
            in: roleNames,
          },
        },
      },
    });

    return count > 0;
  }

  /**
   * Check if user has permission
   *
   * @param userId User ID
   * @param permission Permission string (e.g., "customers:read")
   */
  async userHasPermission(
    userId: string,
    permission: string,
  ): Promise<PermissionCheckResult> {
    const [resource, action] = permission.split(':');

    if (!resource || !action) {
      return { allowed: false, reason: 'Invalid permission format' };
    }

    const userRoles = await this.getUserRoles(userId);

    for (const userRole of userRoles) {
      const hasPermission = userRole.role.permissions.some(
        (rp) =>
          rp.permission.resource === resource &&
          rp.permission.action === action,
      );

      if (hasPermission) {
        return { allowed: true };
      }
    }

    return {
      allowed: false,
      reason: `Missing permission: ${permission}`,
    };
  }

  /**
   * Check if user has all specified permissions
   */
  async userHasAllPermissions(
    userId: string,
    permissions: string[],
  ): Promise<PermissionCheckResult> {
    for (const permission of permissions) {
      const result = await this.userHasPermission(userId, permission);
      if (!result.allowed) {
        return result;
      }
    }

    return { allowed: true };
  }

  /**
   * Initialize system roles
   * Creates default roles if they don't exist
   */
  async initializeSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        name: SystemRole.SUPER_ADMIN,
        description: 'Full system access',
        isSystem: true,
      },
      {
        name: SystemRole.BUSINESS_OWNER,
        description: 'Business owner with full business access',
        isSystem: true,
      },
      {
        name: SystemRole.BUSINESS_MANAGER,
        description: 'Business manager with limited business access',
        isSystem: true,
      },
      {
        name: SystemRole.CUSTOMER,
        description: 'Standard customer user',
        isSystem: true,
      },
      {
        name: SystemRole.SUPPORT_AGENT,
        description: 'Customer support agent',
        isSystem: true,
      },
    ];

    for (const roleData of systemRoles) {
      const existing = await this.findRoleByName(roleData.name);

      if (!existing) {
        await this.prisma.role.create({
          data: roleData,
        });
        this.logger.log(`System role created: ${roleData.name}`);
      }
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Find role by name
   */
  private async findRoleByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  /**
   * Get user by ID
   */
  private async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  /**
   * Assign permissions to role
   */
  private async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    const records = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));

    await this.prisma.rolePermission.createMany({
      data: records,
    });
  }
}
