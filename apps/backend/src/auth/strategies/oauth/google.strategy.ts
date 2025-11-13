import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { requireEnv } from '../../../common/utils/env.util';

/**
 * Google OAuth Strategy
 * Handles Google Sign-In authentication
 *
 * Flow:
 * 1. User clicks "Sign in with Google"
 * 2. Redirects to Google consent screen
 * 3. Google redirects back with code
 * 4. Strategy exchanges code for user profile
 * 5. Returns profile to AuthService for processing
 *
 * Environment variables (fail-fast validation):
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_CALLBACK_URL
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    // Validate env vars BEFORE passing to super() - fails fast if missing
    const clientID = requireEnv('GOOGLE_CLIENT_ID');
    const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET');
    const callbackURL = requireEnv('GOOGLE_CALLBACK_URL');

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  /**
   * Validate Google OAuth callback
   * Called after successful Google authentication
   *
   * @param accessToken Google access token
   * @param refreshToken Google refresh token
   * @param profile User profile from Google
   * @param done Callback function
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0]?.value,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
