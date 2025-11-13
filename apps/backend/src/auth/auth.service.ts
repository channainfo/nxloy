import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Inject,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload, JwtRefreshPayload } from './interfaces/jwt-payload.interface';
import { randomBytes } from 'crypto';
import { VerificationService } from '../verification/verification.service';
import { SecurityService } from '../security/security.service';
import { PasswordUtil } from './utils/password.util';
import { requireEnv } from '../common/utils/env.util';
import { sanitizeEmail } from '../common/utils/email.util';
import { OAuthProfile } from './interfaces/oauth-profile.interface';

/**
 * Auth Service
 * Handles core authentication logic:
 * - User signup with password hashing
 * - Login with credential validation
 * - JWT token generation
 * - Refresh token rotation
 *
 * Standards (CLAUDE.md):
 * - Max 40 lines per method
 * - Max 3 parameters
 * - No fallback defaults for env vars
 */
@Injectable()
export class AuthService {
  private readonly prisma: PrismaClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly verificationService: VerificationService,
    private readonly securityService: SecurityService,
    @Optional() @Inject(PrismaClient) prisma?: PrismaClient,
  ) {
    this.prisma = prisma || new PrismaClient();
    // Env var validation handled at usage sites via requireEnv()
  }

  /**
   * Signup: Create new user with hashed password
   * Sends verification email after creation
   *
   * @param signupDto User registration data
   * @returns Created user (password hash excluded)
   */
  async signup(signupDto: SignupDto) {
    await this.checkEmailExists(signupDto.email);

    const passwordHash = await this.hashPassword(signupDto.password);

    const user = await this.createUser(signupDto, passwordHash);

    // Send email verification PIN
    await this.sendEmailVerification(user.email, user.id);

    return this.excludePassword(user);
  }

  /**
   * Login: Validate credentials and issue tokens
   *
   * @param loginDto Login credentials
   * @returns Access token + refresh token
   */
  async login(loginDto: LoginDto) {
    // Check account lockout status
    const lockoutStatus = await this.securityService.checkLockoutStatus(
      loginDto.email,
    );

    if (lockoutStatus.isLocked) {
      throw new UnauthorizedException(
        `Account locked until ${lockoutStatus.lockedUntil?.toISOString()}`,
      );
    }

    try {
      const user = await this.validateCredentials(
        loginDto.email,
        loginDto.password,
      );

      const tokens = await this.generateTokens(user.id, user.email);

      await this.updateLastLogin(user.id);

      // Record successful login
      await this.securityService.recordLoginAttempt(loginDto.email, true);

      return {
        user: this.excludePassword(user),
        ...tokens,
      };
    } catch (error) {
      // Record failed login attempt
      await this.securityService.recordLoginAttempt(loginDto.email, false);
      throw error;
    }
  }

  /**
   * Refresh: Generate new access token using refresh token
   *
   * @param refreshToken Existing refresh token
   * @returns New access token + new refresh token (rotation)
   */
  async refresh(refreshToken: string) {
    const payload = await this.validateRefreshToken(refreshToken);

    await this.revokeRefreshToken(payload.tokenId);

    // Get user to retrieve email for token generation
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { email: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(payload.sub, user.email);
  }

  /**
   * Logout: Revoke session and refresh tokens
   *
   * @param userId User ID
   * @param sessionId Optional session ID
   */
  async logout(userId: string, sessionId?: string) {
    if (sessionId) {
      await this.revokeSession(sessionId);
    }

    await this.revokeUserRefreshTokens(userId);
  }

  /**
   * Validate user credentials (for Passport LocalStrategy)
   * Returns user if valid, null if invalid
   * Does NOT throw exceptions
   *
   * @param email User email
   * @param password Plain text password
   * @returns User object or null
   */
  async validateUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: sanitizeEmail(email) },
      });

      if (!user || !user.passwordHash) {
        return null;
      }

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        return null;
      }

      const isValid = await PasswordUtil.verify(password, user.passwordHash);

      if (!isValid) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS (Keep under 40 lines each)
  // ============================================================================

  /**
   * Check if email already exists
   * Throws ConflictException if found
   */
  private async checkEmailExists(email: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({
      where: { email: sanitizeEmail(email) },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }
  }

  /**
   * Hash password using PasswordUtil (bcrypt with 10 rounds)
   */
  private async hashPassword(password: string): Promise<string> {
    return PasswordUtil.hash(password);
  }

  /**
   * Create user record in database
   */
  private async createUser(dto: SignupDto, passwordHash: string) {
    return this.prisma.user.create({
      data: {
        email: sanitizeEmail(dto.email),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        locale: dto.locale || 'EN',
        timezone: dto.timezone || 'UTC',
      },
    });
  }

  /**
   * Validate login credentials
   * Throws UnauthorizedException if invalid
   */
  private async validateCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: sanitizeEmail(email) },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await PasswordUtil.verify(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Generate access token + refresh token
   * Returns both tokens with expiry
   */
  private async generateTokens(userId: string, email: string) {
    const accessToken = await this.generateAccessToken(userId, email);
    const refreshToken = await this.generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
      expiresIn: requireEnv('JWT_EXPIRES_IN'),
    };
  }

  /**
   * Generate JWT access token
   */
  private async generateAccessToken(
    userId: string,
    email: string,
  ): Promise<string> {
    const payload: JwtPayload = { sub: userId, email };

    return this.jwtService.signAsync(payload, {
      secret: requireEnv('JWT_SECRET'),
      expiresIn: requireEnv('JWT_EXPIRES_IN'),
    });
  }

  /**
   * Generate refresh token and store in database
   * Implements token family for rotation security
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    const family = randomBytes(16).toString('hex');
    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        family,
        expiresAt,
      },
    });

    const payload: JwtRefreshPayload = {
      sub: userId,
      tokenId: refreshTokenRecord.id,
      family,
    };

    return this.jwtService.signAsync(payload, {
      secret: requireEnv('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });
  }

  /**
   * Validate refresh token JWT and check database record
   */
  private async validateRefreshToken(
    token: string,
  ): Promise<JwtRefreshPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
        token,
        {
          secret: requireEnv('JWT_REFRESH_SECRET'),
        },
      );

      const record = await this.checkRefreshTokenRecord(payload.tokenId);

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Check refresh token exists and not revoked
   */
  private async checkRefreshTokenRecord(tokenId: string) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
    });

    if (!record || record.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return record;
  }

  /**
   * Revoke refresh token (mark as revoked, don't delete)
   */
  private async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoke all refresh tokens for user (logout everywhere)
   */
  private async revokeUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoke session (marks as revoked)
   */
  private async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Update user's last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Exclude password from user object
   * Never return password hash to client
   */
  private excludePassword(user: any) {
    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Send email verification PIN
   */
  private async sendEmailVerification(
    email: string,
    userId: string,
  ): Promise<void> {
    await this.verificationService.requestPin({
      identifier: email,
      type: 'EMAIL_VERIFICATION',
      userId,
    });
  }

  /**
   * Forgot Password: Send password reset PIN
   *
   * @param dto Email address
   * @returns Success status
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: boolean }> {
    const user = await this.findUserByEmail(dto.email);

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return { success: true };
    }

    await this.verificationService.requestPin({
      identifier: dto.email,
      type: 'PASSWORD_RESET',
      userId: user.id,
    });

    return { success: true };
  }

  /**
   * Reset Password: Verify PIN and update password
   *
   * @param dto Email, PIN, new password
   * @returns Success status
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean }> {
    // Verify PIN
    const verification = await this.verificationService.verifyPin({
      identifier: dto.email,
      pin: dto.pin,
    });

    if (!verification.success) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Update password
    const user = await this.findUserByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const newPasswordHash = await this.hashPassword(dto.newPassword);

    await this.updatePassword(user.id, newPasswordHash);

    // Revoke all refresh tokens (logout everywhere)
    await this.revokeUserRefreshTokens(user.id);

    return { success: true };
  }

  /**
   * Find user by email
   */
  private async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: sanitizeEmail(email) },
    });
  }

  /**
   * Update user password
   */
  private async updatePassword(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  /**
   * OAuth Login: Handle OAuth provider authentication
   * Creates user if doesn't exist, links account, issues tokens
   *
   * @param oauthUser OAuth profile data
   * @returns User + tokens
   */
  async oauthLogin(oauthUser: OAuthProfile) {
    let user = await this.findOrCreateOAuthUser(oauthUser);

    await this.createOrUpdateOAuthAccount(user.id, oauthUser);

    const tokens = await this.generateTokens(user.id, user.email);

    await this.updateLastLogin(user.id);

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  /**
   * Find or create user from OAuth profile
   */
  private async findOrCreateOAuthUser(oauthUser: OAuthProfile) {
    // Check if account already linked
    const existingAccount = await this.findOAuthAccount(
      oauthUser.provider,
      oauthUser.providerId,
    );

    if (existingAccount) {
      return existingAccount.user;
    }

    // Check if user exists by email
    let user = await this.findUserByEmail(oauthUser.email);

    if (!user) {
      // Create new user
      user = await this.createOAuthUser(oauthUser);
    }

    return user;
  }

  /**
   * Find OAuth account by provider and providerId
   */
  private async findOAuthAccount(provider: string, providerId: string) {
    return this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: providerId,
        },
      },
      include: { user: true },
    });
  }

  /**
   * Create user from OAuth profile
   */
  private async createOAuthUser(oauthUser: OAuthProfile) {
    return this.prisma.user.create({
      data: {
        email: sanitizeEmail(oauthUser.email),
        firstName: oauthUser.firstName || 'Unknown',
        lastName: oauthUser.lastName || 'User',
        emailVerified: new Date(), // OAuth emails are pre-verified
      },
    });
  }

  /**
   * Create or update OAuth account record
   */
  private async createOrUpdateOAuthAccount(userId: string, oauthUser: OAuthProfile) {
    return this.prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: oauthUser.provider,
          providerAccountId: oauthUser.providerId,
        },
      },
      create: {
        userId,
        type: 'oauth',
        provider: oauthUser.provider,
        providerAccountId: oauthUser.providerId,
        access_token: oauthUser.accessToken,
        refresh_token: oauthUser.refreshToken,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
      },
      update: {
        access_token: oauthUser.accessToken,
        refresh_token: oauthUser.refreshToken,
      },
    });
  }
}
