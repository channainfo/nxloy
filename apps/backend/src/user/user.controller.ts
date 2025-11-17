import {
  Controller,
  Get,
  Put,
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
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

/**
 * User Controller
 * Handles user profile and session management
 *
 * Endpoints:
 * - GET /user/profile - Get current user profile
 * - PUT /user/profile - Update profile
 * - GET /user/sessions - Get active sessions
 * - DELETE /user/sessions/:id - Revoke specific session
 * - DELETE /user/sessions - Revoke all sessions (except current)
 */
@ApiTags('User')
@ApiBearerAuth('JWT-auth')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /user/profile
   * Get current user profile
   */
  @Get('profile')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get current authenticated user profile information.',
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getProfile(user.userId);
  }

  /**
   * PUT /user/profile
   * Update user profile
   */
  @Put('profile')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update current user profile information (name, phone, locale, timezone).',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.userId, dto);
  }

  /**
   * GET /user/sessions
   * Get active sessions
   */
  @Get('sessions')
  @ApiOperation({
    summary: 'Get active sessions',
    description: 'List all active sessions for the current user.',
  })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getSessions(user.userId);
  }

  /**
   * DELETE /user/sessions/:id
   * Revoke specific session
   */
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke session',
    description: 'Revoke a specific session by ID.',
  })
  @ApiParam({ name: 'id', description: 'Session ID to revoke' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') sessionId: string,
  ) {
    return this.userService.revokeSession(user.userId, sessionId);
  }

  /**
   * DELETE /user/sessions
   * Revoke all sessions except current
   */
  @Delete('sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke all sessions',
    description: 'Revoke all sessions except the current one.',
  })
  @ApiResponse({ status: 200, description: 'All sessions revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revokeAllSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.revokeAllSessions(user.userId, user.sessionId);
  }
}
