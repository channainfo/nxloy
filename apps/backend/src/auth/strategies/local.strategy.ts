import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * Local Strategy (Email + Password)
 * Used by passport-local for traditional login
 *
 * Validates credentials and returns user if valid
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Use email instead of username
      passwordField: 'password',
    });
  }

  /**
   * Validate credentials
   * Called by Passport during authentication
   *
   * @param email User email
   * @param password User password
   * @returns User object (without password)
   */
  async validate(email: string, password: string): Promise<any> {
    // AuthService.login handles validation and throws UnauthorizedException
    const result = await this.authService.login({ email, password });

    if (!result.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return result.user;
  }
}
