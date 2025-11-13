/**
 * OAuth Profile Interface
 * Standardized user profile structure returned by all OAuth providers
 * (Google, Facebook, Apple)
 */
export interface OAuthProfile {
  /**
   * OAuth provider name
   */
  provider: 'google' | 'facebook' | 'apple';

  /**
   * Provider-specific user ID
   */
  providerId: string;

  /**
   * User email address
   * Note: Some providers may not return email in all cases
   */
  email: string;

  /**
   * User's first name
   */
  firstName: string | null;

  /**
   * User's last name
   */
  lastName: string | null;

  /**
   * Profile picture URL
   * Optional - not all providers return this
   */
  picture?: string;

  /**
   * OAuth access token
   * Used to access provider APIs on behalf of user
   */
  accessToken: string;

  /**
   * OAuth refresh token
   * Used to obtain new access tokens
   * Optional - not all providers return this
   */
  refreshToken?: string;
}
