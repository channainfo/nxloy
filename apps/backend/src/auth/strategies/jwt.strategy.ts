import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { JwtPayload, AuthenticatedUser } from '../interfaces/jwt-payload.interface';
import { requireEnv } from '../../common/utils/env.util';

/**
 * JWT Strategy
 * Validates JWT tokens from Authorization header
 *
 * Extracts user from token payload and attaches to request
 *
 * Environment variables (fail-fast validation):
 * - JWT_SECRET: Secret key for token verification
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaClient) {
    // Validate env vars BEFORE passing to super() - fails fast if missing
    const jwtSecret = requireEnv('JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validate JWT payload
   * Called by Passport after token signature verification
   *
   * @param payload Decoded JWT payload
   * @returns Authenticated user object (attached to request.user)
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Verify user still exists and is active
    const user = await this.verifyUserExists(payload.sub);

    return {
      userId: payload.sub,
      email: payload.email,
      sessionId: payload.sessionId,
    };
  }

  /**
   * Verify user exists in database
   * Throws if user deleted or inactive
   */
  private async verifyUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
