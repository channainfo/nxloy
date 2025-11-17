import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@nicokaiser/passport-apple';
import { readFileSync } from 'fs';
import { requireEnv } from '../../../common/utils/env.util';

/**
 * Apple OAuth Strategy
 * Handles Sign in with Apple authentication
 *
 * Important Notes:
 * - Apple only sends name/email on first sign-in
 * - Subsequent sign-ins only include providerId
 * - Store name from first sign-in in Account model
 *
 * Flow:
 * 1. User clicks "Sign in with Apple"
 * 2. Redirects to Apple consent screen
 * 3. Apple redirects back with code
 * 4. Strategy validates and returns profile
 *
 * Environment variables (fail-fast validation):
 * - APPLE_CLIENT_ID
 * - APPLE_TEAM_ID
 * - APPLE_KEY_ID
 * - APPLE_CALLBACK_URL
 * - APPLE_PRIVATE_KEY_PATH
 */
@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    // Validate env vars BEFORE passing to super() - fails fast if missing
    const clientID = requireEnv('APPLE_CLIENT_ID');
    const teamID = requireEnv('APPLE_TEAM_ID');
    const keyID = requireEnv('APPLE_KEY_ID');
    const callbackURL = requireEnv('APPLE_CALLBACK_URL');
    const privateKeyPath = requireEnv('APPLE_PRIVATE_KEY_PATH');

    // Read private key from file - throw error if fails
    let privateKey: string;
    try {
      privateKey = readFileSync(privateKeyPath, 'utf8');
    } catch (error) {
      // Log detailed error internally but throw generic error to prevent path exposure
      console.error(`Failed to read Apple private key from ${privateKeyPath}:`, error);
      throw new Error('Failed to read Apple private key - check APPLE_PRIVATE_KEY_PATH configuration');
    }

    super({
      clientID,
      teamID,
      keyID,
      key: privateKey,
      callbackURL,
      scope: ['name', 'email'],
    });
  }

  /**
   * Validate Apple OAuth callback
   * Called after successful Apple authentication
   *
   * @param accessToken Apple access token
   * @param refreshToken Apple refresh token
   * @param profile User profile from Apple
   * @param done Callback function
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, email, name } = profile;

    const user = {
      provider: 'apple',
      providerId: id,
      email: email,
      firstName: name?.firstName || null,
      lastName: name?.lastName || null,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
