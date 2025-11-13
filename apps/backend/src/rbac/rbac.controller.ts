import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

/**
 * RBAC Controller
 * Handles Role-Based Access Control endpoints
 *
 * Endpoints:
 * - POST /rbac/roles - Create new role (SUPER_ADMIN only)
 * - GET /rbac/roles - Get all roles
 * - GET /rbac/roles/:id - Get role by ID
 * - DELETE /rbac/roles/:id - Delete role (SUPER_ADMIN only)
 * - POST /rbac/users/:userId/roles - Assign role to user
 * - DELETE /rbac/users/:userId/roles/:roleId - Remove role from user
 * - GET /rbac/users/:userId/roles - Get user roles
 */
@Controller('rbac')
@UseGuards(JwtAuthGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  /**
   * POST /rbac/roles
   * Create new role (SUPER_ADMIN only)
   */
  @Post('roles')
  @Roles('SUPER_ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  /**
   * GET /rbac/roles
   * Get all roles
   */
  @Get('roles')
  async getRoles() {
    return this.rbacService.getRoles();
  }

  /**
   * GET /rbac/roles/:id
   * Get role by ID
   */
  @Get('roles/:id')
  async getRoleById(@Param('id') id: string) {
    return this.rbacService.getRoleById(id);
  }

  /**
   * DELETE /rbac/roles/:id
   * Delete role (SUPER_ADMIN only, cannot delete system roles)
   */
  @Delete('roles/:id')
  @Roles('SUPER_ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  /**
   * POST /rbac/users/:userId/roles
   * Assign role to user
   */
  @Post('users/:userId/roles')
  @Roles('SUPER_ADMIN', 'BUSINESS_OWNER')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.rbacService.assignRoleToUser(userId, dto, user.userId);
  }

  /**
   * DELETE /rbac/users/:userId/roles/:roleId
   * Remove role from user
   */
  @Delete('users/:userId/roles/:roleId')
  @Roles('SUPER_ADMIN', 'BUSINESS_OWNER')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rbacService.removeRoleFromUser(userId, roleId);
  }

  /**
   * GET /rbac/users/:userId/roles
   * Get user roles
   */
  @Get('users/:userId/roles')
  async getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId);
  }

  /**
   * GET /rbac/me/roles
   * Get current user's roles
   */
  @Get('me/roles')
  async getMyRoles(@CurrentUser() user: AuthenticatedUser) {
    return this.rbacService.getUserRoles(user.userId);
  }
}
