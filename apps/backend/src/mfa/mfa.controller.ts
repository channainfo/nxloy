import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
@ApiTags('MFA')
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({
    summary: 'Setup TOTP',
    description: 'Get TOTP setup information including QR code, secret, and backup codes.',
  })
  @ApiResponse({ status: 200, description: 'TOTP setup data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Enable TOTP',
    description: 'Enable TOTP MFA after verifying the code from authenticator app.',
  })
  @ApiResponse({ status: 200, description: 'TOTP enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid TOTP code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Disable MFA',
    description: 'Disable multi-factor authentication for the user.',
  })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Verify MFA code',
    description: 'Verify MFA code during login (TOTP or backup code).',
  })
  @ApiResponse({ status: 200, description: 'MFA code verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid MFA code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Regenerate backup codes',
    description: 'Generate new backup codes (invalidates all existing backup codes).',
  })
  @ApiResponse({ status: 200, description: 'Backup codes regenerated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async regenerateBackupCodes(@CurrentUser() user: AuthenticatedUser) {
    const codes = await this.mfaService.regenerateBackupCodes(user.userId);
    return { backupCodes: codes };
  }
}
