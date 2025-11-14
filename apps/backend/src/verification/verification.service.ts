import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { PrismaClient, VerificationType } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';
import { EmailTemplate } from '../email/interfaces/email.interface';
import { RequestPinDto } from './dto/request-pin.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { QueueService } from '../queue/queue.service';
import { requireEnv } from '../common/utils/env.util';

/**
 * Options for creating verification record
 * Max 3 parameters per CLAUDE.md - using options object pattern
 */
interface CreateVerificationOptions {
  identifier: string;
  type: VerificationType;
  pinHash: string;
  pinSalt: string;
  token: string;
  expiresAt: Date;
  userId?: string;
}

/**
 * Verification Service
 * Handles PIN-based verification for:
 * - Email verification
 * - Phone verification
 * - Password reset
 * - Account linking
 * - Two-factor authentication
 * - Phone number changes
 *
 * Security Features:
 * - 6-digit PIN hashed with SHA-256 + salt
 * - UUID token for email link fallback
 * - Max 5 failed attempts before blocking
 * - Time-based expiry (5-15 min depending on type)
 * - Single-use enforcement
 *
 * Standards (CLAUDE.md):
 * - Max 40 lines per method
 * - Max 3 parameters
 */
@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private readonly prisma: PrismaClient;

  constructor(
    private readonly emailService: EmailService,
    @Optional() private readonly queueService?: QueueService,
    @Optional() @Inject(PrismaClient) prisma?: PrismaClient,
  ) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Request new verification PIN
   * Generates PIN, sends via email or SMS
   */
  async requestPin(dto: RequestPinDto): Promise<{ success: boolean }> {
    const pin = this.generatePin();
    const token = this.generateToken();
    const { pinHash, pinSalt } = this.hashPin(pin);

    const expiresAt = this.calculateExpiry(dto.type as VerificationType);

    await this.createVerificationRecord({
      identifier: dto.identifier,
      type: dto.type as VerificationType,
      pinHash,
      pinSalt,
      token,
      expiresAt,
      userId: dto.userId,
    });

    await this.sendVerificationMessage(dto.identifier, dto.type, pin, token);

    this.logger.log(
      `PIN requested: ${dto.type} for ${dto.identifier}`,
    );

    return { success: true };
  }

  /**
   * Verify PIN code
   * Validates PIN and marks as used if correct
   */
  async verifyPin(dto: VerifyPinDto): Promise<{ success: boolean; token?: string }> {
    const record = await this.findActiveVerification(dto.identifier);

    if (!record) {
      throw new BadRequestException('No active verification found');
    }

    if (record.attempts >= 5) {
      throw new BadRequestException('Maximum attempts exceeded');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Verification code expired');
    }

    const isValid = this.validatePin(dto.pin, record.pinHash, record.pinSalt);

    if (!isValid) {
      await this.incrementAttempts(record.id);
      throw new UnauthorizedException('Invalid verification code');
    }

    await this.markAsUsed(record.id);

    this.logger.log(
      `PIN verified successfully: ${record.type} for ${dto.identifier}`,
    );

    return { success: true, token: record.token };
  }

  /**
   * Verify token (email link fallback)
   * Alternative to PIN for email verification
   */
  async verifyToken(token: string): Promise<{ success: boolean }> {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.usedAt) {
      throw new BadRequestException('Invalid or expired token');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    await this.markAsUsed(record.id);

    this.logger.log(`Token verified: ${record.type} for ${record.identifier}`);

    return { success: true };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Generate random 6-digit PIN
   */
  private generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate UUID token for email link
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Hash PIN with SHA-256 + random salt
   */
  private hashPin(pin: string): { pinHash: string; pinSalt: string } {
    const pinSalt = randomBytes(16).toString('hex');
    const pinHash = createHash('sha256')
      .update(pin + pinSalt)
      .digest('hex');

    return { pinHash, pinSalt };
  }

  /**
   * Validate PIN against stored hash
   */
  private validatePin(pin: string, hash: string, salt: string): boolean {
    const inputHash = createHash('sha256')
      .update(pin + salt)
      .digest('hex');

    return inputHash === hash;
  }

  /**
   * Calculate expiry time based on verification type
   */
  private calculateExpiry(type: VerificationType): Date {
    const now = new Date();
    const minutes = this.getExpiryMinutes(type);
    return new Date(now.getTime() + minutes * 60000);
  }

  /**
   * Get expiry duration in minutes by type
   */
  private getExpiryMinutes(type: VerificationType): number {
    const expiryMap = {
      EMAIL_VERIFICATION: 15,
      PHONE_VERIFICATION: 10,
      PASSWORD_RESET: 15,
      ACCOUNT_LINKING: 10,
      TWO_FACTOR_AUTH: 5,
      PHONE_NUMBER_CHANGE: 10,
    };

    return expiryMap[type] || 15;
  }

  /**
   * Create verification record in database
   */
  private async createVerificationRecord(
    options: CreateVerificationOptions,
  ) {
    return this.prisma.verificationToken.create({
      data: {
        identifier: options.identifier,
        type: options.type,
        pinHash: options.pinHash,
        pinSalt: options.pinSalt,
        token: options.token,
        expiresAt: options.expiresAt,
        userId: options.userId,
      },
    });
  }

  /**
   * Find active verification for identifier
   */
  private async findActiveVerification(identifier: string) {
    return this.prisma.verificationToken.findFirst({
      where: {
        identifier,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Increment failed attempts counter
   */
  private async incrementAttempts(id: string): Promise<void> {
    await this.prisma.verificationToken.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  /**
   * Mark verification as used
   */
  private async markAsUsed(id: string): Promise<void> {
    await this.prisma.verificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  /**
   * Send verification message via email or SMS
   */
  private async sendVerificationMessage(
    identifier: string,
    type: string,
    pin: string,
    token: string,
  ): Promise<void> {
    // For email-based verification
    if (identifier.includes('@')) {
      await this.sendEmailVerification(identifier, type, pin, token);
    }
    // For SMS-based verification (future implementation)
    else {
      this.logger.warn('SMS verification not yet implemented');
      // TODO: Implement SMS sending (Twilio, AWS SNS, etc.)
    }
  }

  /**
   * Send email verification message
   */
  private async sendEmailVerification(
    email: string,
    type: string,
    pin: string,
    token: string,
  ): Promise<void> {
    const template = this.getEmailTemplate(type);
    const subject = this.getEmailSubject(type);
    const verificationLink = this.buildVerificationLink(token);

    await this.emailService.sendEmail({
      to: email,
      subject,
      template,
      context: {
        pin,
        token,
        verificationLink,
        expiryMinutes: this.getExpiryMinutes(type as VerificationType),
        purpose: this.getPurposeLabel(type),
      },
    });
  }

  /**
   * Get email template for verification type
   */
  private getEmailTemplate(type: string): EmailTemplate {
    const templateMap: Record<string, EmailTemplate> = {
      EMAIL_VERIFICATION: EmailTemplate.EMAIL_VERIFICATION,
      PASSWORD_RESET: EmailTemplate.PASSWORD_RESET,
      TWO_FACTOR_AUTH: EmailTemplate.TWO_FACTOR_CODE,
      default: EmailTemplate.PIN_VERIFICATION,
    };

    return templateMap[type] || templateMap.default;
  }

  /**
   * Get email subject for verification type
   */
  private getEmailSubject(type: string): string {
    const subjectMap: Record<string, string> = {
      EMAIL_VERIFICATION: 'Verify Your Email Address',
      PASSWORD_RESET: 'Reset Your Password',
      TWO_FACTOR_AUTH: 'Your Two-Factor Authentication Code',
      PHONE_NUMBER_CHANGE: 'Verify Your New Phone Number',
      ACCOUNT_LINKING: 'Link Your Account',
      default: 'Your Verification Code',
    };

    return subjectMap[type] || subjectMap.default;
  }

  /**
   * Get human-readable purpose label
   */
  private getPurposeLabel(type: string): string {
    return type.toLowerCase().replace(/_/g, ' ');
  }

  /**
   * Build verification link for email
   */
  private buildVerificationLink(token: string): string {
    const baseUrl = requireEnv('APP_URL');
    return `${baseUrl}/verify?token=${token}`;
  }
}
