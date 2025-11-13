import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MfaService } from './mfa.service';
import { EnableTotpDto } from './dto/enable-totp.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

/**
 * MFA Controller
 * Handles Multi-Factor Authentication endpoints
 *
 * Endpoints:
 * - GET /mfa/setup-totp - Get TOTP setup (QR code, secret, backup codes)
 * - POST /mfa/enable-totp - Enable TOTP after verification
 * - POST /mfa/disable - Disable MFA
 * - POST /mfa/verify - Verify MFA code during login
 * - POST /mfa/regenerate-backup-codes - Generate new backup codes
 */
@Controller('mfa')
@UseGuards(JwtAuthGuard)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  /**
   * GET /mfa/setup-totp
   * Get TOTP setup data (QR code, secret, backup codes)
   *
   * @param user Authenticated user
   * @returns TOTP setup response
   */
  @Get('setup-totp')
  async setupTotp(@CurrentUser() user: AuthenticatedUser) {
    return this.mfaService.setupTotp(user.userId);
  }

  /**
   * POST /mfa/enable-totp
   * Enable TOTP after verifying code
   *
   * @param user Authenticated user
   * @param dto TOTP code
   * @returns Success status
   */
  @Post('enable-totp')
  @HttpCode(HttpStatus.OK)
  async enableTotp(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EnableTotpDto,
  ) {
    return this.mfaService.enableTotp(user.userId, dto.code);
  }

  /**
   * POST /mfa/disable
   * Disable MFA for user
   *
   * @param user Authenticated user
   * @returns Success status
   */
  @Post('disable')
  @HttpCode(HttpStatus.OK)
  async disableMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.mfaService.disableMfa(user.userId);
  }

  /**
   * POST /mfa/verify
   * Verify MFA code during login
   *
   * @param user Authenticated user
   * @param dto MFA verification data
   * @returns Verification result
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VerifyMfaDto,
  ) {
    return this.mfaService.verifyMfa(user.userId, dto.method, dto.code);
  }

  /**
   * POST /mfa/regenerate-backup-codes
   * Generate new backup codes (invalidates old ones)
   *
   * @param user Authenticated user
   * @returns New backup codes
   */
  @Post('regenerate-backup-codes')
  @HttpCode(HttpStatus.OK)
  async regenerateBackupCodes(@CurrentUser() user: AuthenticatedUser) {
    const codes = await this.mfaService.regenerateBackupCodes(user.userId);
    return { backupCodes: codes };
  }
}
