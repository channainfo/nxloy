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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
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
@ApiTags('RBAC')
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({
    summary: 'Create new role',
    description: 'Create a new custom role (SUPER_ADMIN only).',
  })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN role' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  /**
   * GET /rbac/roles
   * Get all roles
   */
  @Get('roles')
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Retrieve all available roles in the system.',
  })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRoles() {
    return this.rbacService.getRoles();
  }

  /**
   * GET /rbac/roles/:id
   * Get role by ID
   */
  @Get('roles/:id')
  @ApiOperation({
    summary: 'Get role by ID',
    description: 'Retrieve a specific role by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Role not found' })
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
  @ApiOperation({
    summary: 'Delete role',
    description: 'Delete a custom role (SUPER_ADMIN only, cannot delete system roles).',
  })
  @ApiParam({ name: 'id', description: 'Role ID to delete' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN role' })
  @ApiResponse({ status: 404, description: 'Role not found' })
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
  @ApiOperation({
    summary: 'Assign role to user',
    description: 'Assign a role to a user (SUPER_ADMIN or BUSINESS_OWNER only).',
  })
  @ApiParam({ name: 'userId', description: 'User ID to assign role to' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or BUSINESS_OWNER role' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
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
  @ApiOperation({
    summary: 'Remove role from user',
    description: 'Remove a role from a user (SUPER_ADMIN or BUSINESS_OWNER only).',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID to remove' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires SUPER_ADMIN or BUSINESS_OWNER role' })
  @ApiResponse({ status: 404, description: 'User or role assignment not found' })
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
  @ApiOperation({
    summary: 'Get user roles',
    description: 'Retrieve all roles assigned to a specific user.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User roles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId);
  }

  /**
   * GET /rbac/me/roles
   * Get current user's roles
   */
  @Get('me/roles')
  @ApiOperation({
    summary: 'Get my roles',
    description: 'Retrieve all roles assigned to the current authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'User roles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyRoles(@CurrentUser() user: AuthenticatedUser) {
    return this.rbacService.getUserRoles(user.userId);
  }
}
