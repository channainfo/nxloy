import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

/**
 * User Module
 * Handles user profile and session management
 *
 * Features:
 * - Get/update user profile
 * - View active sessions
 * - Revoke sessions (single or all)
 * - Audit logging for profile changes
 */
@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
