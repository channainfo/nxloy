import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { createHash, randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';
import { EmailTemplate } from '../email/interfaces/email.interface';
import {
  MfaMethod,
  TotpSetupResponse,
  MfaVerificationResult,
} from './interfaces/mfa.interface';

/**
 * MFA Service
 * Handles Multi-Factor Authentication:
 * - TOTP (Time-based One-Time Password) for authenticator apps
 * - Backup codes (one-time use emergency codes)
 * - SMS codes (future implementation)
 * - Email codes (uses existing verification system)
 *
 * Standards (CLAUDE.md):
 * - Max 40 lines per method
 * - Max 3 parameters
 */
@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly prisma: PrismaClient;

  constructor(
    private readonly emailService: EmailService,
    @Optional() @Inject(PrismaClient) prisma?: PrismaClient,
  ) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Setup TOTP for user
   * Generates secret, QR code, and backup codes
   *
   * @param userId User ID
   * @returns TOTP setup data (secret, QR code, backup codes)
   */
  async setupTotp(userId: string): Promise<TotpSetupResponse> {
    const user = await this.getUser(userId);

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA already enabled');
    }

    const secret = this.generateTotpSecret();
    const qrCodeUrl = await this.generateQrCode(user.email, secret);
    const backupCodes = this.generateBackupCodes();

    await this.storeTotpSecret(userId, secret);
    await this.storeBackupCodes(userId, backupCodes);

    this.logger.log(`TOTP setup initiated for user ${userId}`);

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Enable TOTP after verification
   * Verifies code and activates MFA
   *
   * @param userId User ID
   * @param code TOTP code from authenticator app
   */
  async enableTotp(userId: string, code: string): Promise<{ success: boolean }> {
    const user = await this.getUserWithMfa(userId);

    if (!user.mfaSecret) {
      throw new BadRequestException('TOTP not set up');
    }

    const isValid = this.verifyTotpCode(user.mfaSecret, code);

    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }

    await this.activateMfa(userId);

    this.logger.log(`TOTP enabled for user ${userId}`);

    return { success: true };
  }

  /**
   * Disable MFA
   * Requires password confirmation in controller
   *
   * @param userId User ID
   */
  async disableMfa(userId: string): Promise<{ success: boolean }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
      },
    });

    await this.deleteBackupCodes(userId);

    this.logger.log(`MFA disabled for user ${userId}`);

    return { success: true };
  }

  /**
   * Verify MFA code during login
   *
   * @param userId User ID
   * @param method MFA method
   * @param code MFA code
   */
  async verifyMfa(
    userId: string,
    method: MfaMethod,
    code: string,
  ): Promise<MfaVerificationResult> {
    const user = await this.getUserWithMfa(userId);

    if (!user.mfaEnabled) {
      throw new BadRequestException('MFA not enabled');
    }

    switch (method) {
      case MfaMethod.TOTP:
        return this.verifyTotpLogin(user.mfaSecret, code);

      case MfaMethod.BACKUP_CODE:
        return this.verifyBackupCode(userId, code);

      case MfaMethod.EMAIL:
        return this.verifyEmailCode(userId, code);

      case MfaMethod.SMS:
        throw new BadRequestException('SMS MFA not yet implemented');

      default:
        throw new BadRequestException('Invalid MFA method');
    }
  }

  /**
   * Generate new backup codes
   * Invalidates old codes
   *
   * @param userId User ID
   * @returns New backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    await this.deleteBackupCodes(userId);

    const backupCodes = this.generateBackupCodes();
    await this.storeBackupCodes(userId, backupCodes);

    this.logger.log(`Backup codes regenerated for user ${userId}`);

    return backupCodes;
  }

  /**
   * Verify TOTP code (public method for testing/direct use)
   *
   * @param userId User ID
   * @param code TOTP code
   * @returns Verification result
   */
  async verifyTotp(userId: string, code: string): Promise<MfaVerificationResult> {
    const user = await this.getUserWithMfa(userId);

    if (!user.mfaEnabled) {
      throw new BadRequestException('MFA not enabled');
    }

    if (!user.mfaSecret) {
      throw new UnauthorizedException('TOTP not configured');
    }

    const isValid = this.verifyTotpCode(user.mfaSecret, code);

    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }

    return {
      success: true,
      method: MfaMethod.TOTP,
    };
  }

  /**
   * Verify backup code (public method for testing/direct use)
   *
   * @param userId User ID
   * @param code Backup code
   * @returns Verification result
   */
  async verifyBackupCode(
    userId: string,
    code: string,
  ): Promise<MfaVerificationResult> {
    const hashedCode = this.hashBackupCode(code);

    const backupCode = await this.prisma.backupCode.findFirst({
      where: {
        userId,
        code: hashedCode,
        usedAt: null,
      },
    });

    if (!backupCode) {
      throw new UnauthorizedException('Invalid or already used backup code');
    }

    await this.markBackupCodeUsed(backupCode.id);

    return { success: true, method: MfaMethod.BACKUP_CODE };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

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
   * Get user with MFA data
   */
  private async getUserWithMfa(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
        mfaSecret: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  /**
   * Generate TOTP secret
   */
  private generateTotpSecret() {
    return speakeasy.generateSecret({
      name: 'NxLoy',
      issuer: 'NxLoy',
      length: 32,
    });
  }

  /**
   * Generate QR code data URL
   */
  private async generateQrCode(email: string, secret: any): Promise<string> {
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: email,
      issuer: 'NxLoy',
      encoding: 'base32',
    });

    return qrcode.toDataURL(otpauthUrl);
  }

  /**
   * Verify TOTP code
   */
  private verifyTotpCode(secret: string, code: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps before/after (60 sec tolerance)
    });
  }

  /**
   * Verify TOTP during login
   */
  private verifyTotpLogin(
    secret: string | null,
    code: string,
  ): MfaVerificationResult {
    if (!secret) {
      throw new UnauthorizedException('TOTP not configured');
    }

    const isValid = this.verifyTotpCode(secret, code);

    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }

    return {
      success: true,
      method: MfaMethod.TOTP,
    };
  }

  /**
   * Generate 10 backup codes (8 chars each, alphanumeric)
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];

    for (let i = 0; i < 10; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }

    return codes;
  }

  /**
   * Hash backup code with SHA-256
   */
  private hashBackupCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  /**
   * Store TOTP secret in database
   */
  private async storeTotpSecret(userId: string, secret: any): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret.base32 },
    });
  }

  /**
   * Store backup codes in database (hashed)
   */
  private async storeBackupCodes(userId: string, codes: string[]) {
    const records = codes.map((code) => ({
      userId,
      code: this.hashBackupCode(code),
    }));

    await this.prisma.backupCode.createMany({
      data: records,
    });
  }

  /**
   * Activate MFA for user
   */
  private async activateMfa(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });
  }

  /**
   * Delete all backup codes for user
   */
  private async deleteBackupCodes(userId: string): Promise<void> {
    await this.prisma.backupCode.deleteMany({
      where: { userId },
    });
  }


  /**
   * Mark backup code as used
   */
  private async markBackupCodeUsed(codeId: string): Promise<void> {
    await this.prisma.backupCode.update({
      where: { id: codeId },
      data: { usedAt: new Date() },
    });
  }

  /**
   * Verify email MFA code
   * Delegates to verification service
   */
  private async verifyEmailCode(
    userId: string,
    code: string,
  ): Promise<MfaVerificationResult> {
    // Email codes handled by verification service
    // This is a placeholder for integration
    return {
      success: false,
      error: 'Use verification service for email codes',
    };
  }
}
