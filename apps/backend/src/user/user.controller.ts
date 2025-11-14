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
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /user/profile
   * Get current user profile
   */
  @Get('profile')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getProfile(user.userId);
  }

  /**
   * PUT /user/profile
   * Update user profile
   */
  @Put('profile')
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
  async getSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getSessions(user.userId);
  }

  /**
   * DELETE /user/sessions/:id
   * Revoke specific session
   */
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
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
  async revokeAllSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.revokeAllSessions(user.userId, user.sessionId);
  }
}
