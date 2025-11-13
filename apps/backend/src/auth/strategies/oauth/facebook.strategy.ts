import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { requireEnv } from '../../../common/utils/env.util';

/**
 * Facebook OAuth Strategy
 * Handles Facebook Login authentication
 *
 * Flow:
 * 1. User clicks "Continue with Facebook"
 * 2. Redirects to Facebook consent screen
 * 3. Facebook redirects back with code
 * 4. Strategy exchanges code for user profile
 * 5. Returns profile to AuthService for processing
 *
 * Environment variables (fail-fast validation):
 * - FACEBOOK_APP_ID
 * - FACEBOOK_APP_SECRET
 * - FACEBOOK_CALLBACK_URL
 */
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    // Validate env vars BEFORE passing to super() - fails fast if missing
    const clientID = requireEnv('FACEBOOK_APP_ID');
    const clientSecret = requireEnv('FACEBOOK_APP_SECRET');
    const callbackURL = requireEnv('FACEBOOK_CALLBACK_URL');

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    });
  }

  /**
   * Validate Facebook OAuth callback
   * Called after successful Facebook authentication
   *
   * @param accessToken Facebook access token
   * @param refreshToken Facebook refresh token
   * @param profile User profile from Facebook
   * @param done Callback function
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: any,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = {
      provider: 'facebook',
      providerId: id,
      email: emails?.[0]?.value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
