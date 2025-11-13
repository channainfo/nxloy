/**
 * JWT Payload Interface
 * Defines the structure of data stored in JWT tokens
 */
export interface JwtPayload {
  sub: string; // User ID (subject)
  email: string;
  sessionId?: string; // Optional: link to session record
  iat?: number; // Issued at (auto-added by JWT)
  exp?: number; // Expiration (auto-added by JWT)
}

/**
 * JWT Refresh Payload Interface
 * Used for refresh token validation
 */
export interface JwtRefreshPayload {
  sub: string; // User ID
  tokenId: string; // RefreshToken ID for rotation tracking
  family: string; // Token family for security
}

/**
 * Authenticated User Interface
 * Attached to request after JWT validation
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  sessionId?: string;
}
