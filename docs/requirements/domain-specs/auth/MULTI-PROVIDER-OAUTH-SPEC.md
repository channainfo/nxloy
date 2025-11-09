# Multi-Provider OAuth Authentication Specification

**Version**: 1.0.0
**Status**: Draft
**Last Updated**: 2025-11-07
 (NxLoy Platform)

---

## Table of Contents

1. [Overview](#overview)
2. [Supported OAuth Providers](#supported-oauth-providers)
3. [Database Schema Design](#database-schema-design)
4. [Provider-Specific Requirements](#provider-specific-requirements)
5. [Security Considerations](#security-considerations)
6. [User Flows](#user-flows)
7. [API Contracts](#api-contracts)
8. [Edge Cases and Error Handling](#edge-cases-and-error-handling)
9. [Implementation Guidelines](#implementation-guidelines)
10. [Migration Strategy](#migration-strategy)

---

## Overview

### Goals

NxLoy platform supports authentication through multiple OAuth providers, allowing users to:
- Sign up and log in using their preferred identity provider
- Link multiple OAuth providers to a single account
- Switch between linked providers seamlessly
- Maintain a unified identity across all providers

### Principles

1. **User owns their identity** - Users can link/unlink providers at will
2. **Email is the primary identifier** - Same email = same user (with verification)
3. **Security first** - All tokens encrypted, PKCE for all flows, email verification required for linking
4. **Provider agnostic** - Easy to add new OAuth providers without schema changes
5. **Graceful degradation** - System works even if a provider is temporarily unavailable

### Supported Providers (Phase 1)

- Apple Sign In
- Facebook Login
- Google Sign In
- Telegram Login
- Email/Password (traditional auth as fallback)

### Future Providers (Phase 2+)

- Twitter/X
- GitHub
- Microsoft
- LINE
- WeChat

---

## Supported OAuth Providers

### Provider Comparison Table

| Provider | OAuth Version | Unique ID Field | Email Guaranteed | Refresh Tokens | Special Requirements |
|----------|---------------|-----------------|------------------|----------------|---------------------|
| Apple | OAuth 2.0 | `sub` | Yes (private relay option) | Yes | Requires paid Apple Developer account |
| Facebook | OAuth 2.0 | `id` | Yes | Long-lived tokens | App review for email permission |
| Google | OAuth 2.0 + OIDC | `sub` | Yes | Yes | PKCE required |
| Telegram | Custom | `id` | No | N/A (no tokens) | Widget-based, HMAC verification |
| Email/Password | N/A | User ID | Yes | N/A | Traditional password hash |

### Provider URLs

| Provider | Authorization URL | Token URL | User Info URL |
|----------|------------------|-----------|---------------|
| Apple | https://appleid.apple.com/auth/authorize | https://appleid.apple.com/auth/token | https://appleid.apple.com/auth/keys |
| Facebook | https://www.facebook.com/v18.0/dialog/oauth | https://graph.facebook.com/v18.0/oauth/access_token | https://graph.facebook.com/v18.0/me |
| Google | https://accounts.google.com/o/oauth2/v2/auth | https://oauth2.googleapis.com/token | https://www.googleapis.com/oauth2/v3/userinfo |
| Telegram | N/A (Widget) | N/A | N/A (Data in callback) |

---

## Database Schema Design

### Core Principle

We follow the **NextAuth/Auth.js** industry-standard pattern:
- **User** table stores core identity (one per person)
- **Account** table stores OAuth provider links (many per user)
- **Session** table stores active sessions
- **VerificationToken** table stores email verification tokens

### Entity Relationship Diagram

```
User (1) ----< (many) Account
  |                       |
  |                       └─ provider: "google", "apple", etc.
  |                       └─ providerAccountId: "12345"
  |                       └─ access_token, refresh_token
  |
  └----< (many) Session
          |
          └─ sessionToken
          └─ expires
```

### User Model (Core Identity)

One user = one person, regardless of how many OAuth providers they use.

**Fields**:
- `id` - Unique identifier (CUID)
- `email` - Primary email (nullable for Telegram-only users initially)
- `emailVerified` - Email verification timestamp
- `phone` - Phone number (nullable)
- `phoneVerified` - Phone verification timestamp
- `passwordHash` - For email/password auth (nullable if OAuth-only)
- `firstName`, `lastName` - User profile data
- `avatarUrl` - Profile picture (can be from OAuth provider)
- `status` - ACTIVE | INACTIVE | SUSPENDED
- Timestamps: `createdAt`, `updatedAt`, `deletedAt`

**Business Rules**:
- Email must be unique across all users (when present)
- Phone must be unique across all users (when present)
- At least one authentication method required (password OR linked OAuth account)
- Cannot delete account if it's the only authentication method

### Account Model (OAuth Provider Links)

One account = one OAuth provider connection.

**Fields**:
- `id` - Unique identifier
- `userId` - Foreign key to User
- `provider` - Provider name: "google", "apple", "facebook", "telegram"
- `providerAccountId` - User's ID on the provider's system (e.g., Google sub claim)
- `type` - "oauth" | "oidc" | "email" | "credentials"
- `scope` - OAuth scopes granted (space-separated string)
- `access_token` - Encrypted access token
- `refresh_token` - Encrypted refresh token (if available)
- `id_token` - Encrypted ID token (for OIDC providers like Google, Apple)
- `token_type` - Usually "Bearer"
- `expires_at` - Access token expiration timestamp
- `session_state` - Optional session state from provider
- Timestamps: `createdAt`, `updatedAt`

**Unique Constraints**:
- `(provider, providerAccountId)` must be unique - prevents duplicate provider accounts
- `userId` - indexed for fast lookup

**Business Rules**:
- User can have multiple accounts (different providers)
- User can have only ONE account per provider
- Cannot unlink last account if user has no password set
- Tokens must be encrypted at rest using AES-256

### Session Model (Active Sessions)

**Fields**:
- `id` - Unique identifier
- `userId` - Foreign key to User
- `sessionToken` - Unique session token (used in cookies/headers)
- `expires` - Session expiration timestamp
- `ipAddress` - IP address for security audit
- `userAgent` - Browser/device info
- `lastActiveAt` - Last activity timestamp
- Timestamps: `createdAt`

**Business Rules**:
- Sessions expire after 7 days of inactivity (configurable)
- Users can have multiple active sessions (different devices)
- Sessions are invalidated on password change
- Sessions can be manually revoked

### VerificationToken Model (Email/Phone Verification)

**Fields**:
- `identifier` - Email or phone to verify
- `token` - Random verification token
- `type` - "email" | "phone" | "password-reset" | "account-link"
- `expires` - Token expiration timestamp
- `createdAt` - Timestamp

**Unique Constraint**:
- `(identifier, token)` must be unique

**Business Rules**:
- Tokens expire after 24 hours
- One-time use only (deleted after verification)
- Maximum 5 tokens per identifier per hour (rate limiting)

---

## Provider-Specific Requirements

### Apple Sign In

**Official Documentation**: https://developer.apple.com/sign-in-with-apple/

**OAuth Flow**: Authorization Code with PKCE

**Required Scopes**: `name`, `email`

**Unique Identifier**: `sub` claim in ID token (stable, never changes)

**Key Fields Returned**:
- `sub` - User's unique identifier (use as providerAccountId)
- `email` - User's email (may be private relay: randomstring@privaterelay.appleid.com)
- `email_verified` - Boolean (always true for Apple)
- `is_private_email` - Boolean (true if using private relay)
- `name` - Only provided on FIRST sign-in (must be cached)

**Special Considerations**:
1. **Name only sent once** - On first authorization, Apple sends user's name. Never sent again. Must store in database immediately.
2. **Private Relay Email** - User may use Apple's private relay email. This is their real email for our purposes.
3. **Email changes** - If user changes email in Apple ID, the `sub` stays the same but email changes.
4. **ID Token Only** - Apple doesn't provide a traditional user info endpoint. All data is in the ID token.
5. **Refresh Tokens** - Apple provides refresh tokens valid for 6 months.

**Token Lifetime**:
- Access token: 10 minutes
- Refresh token: 6 months
- ID token: 10 minutes

**Required Configuration**:
```
APPLE_CLIENT_ID=com.nxloy.app
APPLE_TEAM_ID=ABC123DEF4
APPLE_KEY_ID=XYZ987654
APPLE_PRIVATE_KEY=<PEM format private key>
```

**Implementation Notes**:
- Must verify ID token signature using Apple's public keys
- Must handle private relay emails gracefully
- Store user's name on first sign-in (never available again)
- Support Sign in with Apple JS widget for web
- Support native Apple Sign In for iOS

### Facebook Login

**Official Documentation**: https://developers.facebook.com/docs/facebook-login

**OAuth Flow**: Authorization Code

**Required Scopes**: `email`, `public_profile`

**Unique Identifier**: `id` field (stable Facebook user ID)

**Key Fields Returned**:
- `id` - User's unique Facebook ID (use as providerAccountId)
- `email` - User's email (requires email permission, may not be verified)
- `name` - Full name
- `first_name`, `last_name` - Name components
- `picture` - Profile picture URL

**Special Considerations**:
1. **Email Permission** - Requires app review to request email in production
2. **Long-lived Tokens** - Exchange short-lived token (1 hour) for long-lived token (60 days)
3. **No Refresh Tokens** - Must extend access token before expiration
4. **Graph API** - All user data fetched via Graph API
5. **Token Expiration** - Must track and extend tokens proactively

**Token Lifetime**:
- Short-lived token: 1 hour (initial)
- Long-lived token: 60 days (after exchange)
- No refresh tokens (must extend before expiration)

**Required Configuration**:
```
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abc123def456ghi789jkl012mno345pq
```

**Implementation Notes**:
- Exchange short-lived for long-lived tokens immediately
- Set up cron job to extend tokens before expiration
- Handle "email permission denied" gracefully (allow signup without email)
- Verify email separately if user grants permission later

### Google Sign In

**Official Documentation**: https://developers.google.com/identity/protocols/oauth2

**OAuth Flow**: Authorization Code with PKCE (required)

**Required Scopes**: `openid`, `email`, `profile`

**Unique Identifier**: `sub` claim in ID token (stable, never changes)

**Key Fields Returned**:
- `sub` - User's unique Google identifier (use as providerAccountId)
- `email` - User's email
- `email_verified` - Boolean (usually true)
- `name` - Full name
- `given_name`, `family_name` - Name components
- `picture` - Profile picture URL
- `locale` - User's locale (e.g., "en-US")

**Special Considerations**:
1. **PKCE Required** - Google requires PKCE for all OAuth flows (security best practice)
2. **OpenID Connect** - Google uses OIDC, provides ID token with user claims
3. **Refresh Tokens** - Only provided if access_type=offline and prompt=consent
4. **Token Revocation** - Users can revoke access via Google Account settings
5. **Email Always Verified** - Google verifies all emails, can trust email_verified claim

**Token Lifetime**:
- Access token: 1 hour
- Refresh token: No expiration (can be revoked)
- ID token: 1 hour

**Required Configuration**:
```
GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789jkl012
GOOGLE_REDIRECT_URI=https://app.nxloy.com/api/auth/callback/google
```

**Implementation Notes**:
- Always use PKCE (code_challenge, code_challenge_method=S256)
- Request offline access to get refresh token on first authorization
- Store and use refresh tokens to get new access tokens
- Handle token revocation gracefully (prompt re-authorization)
- Verify ID token signature using Google's public keys

### Telegram Login

**Official Documentation**: https://core.telegram.org/widgets/login

**OAuth Flow**: Custom widget-based flow (not standard OAuth 2.0)

**Required Widget Parameters**: None (basic user info always provided)

**Unique Identifier**: `id` field (stable Telegram user ID)

**Key Fields Returned** (via widget callback):
- `id` - User's unique Telegram ID (use as providerAccountId)
- `first_name` - First name
- `last_name` - Last name (optional)
- `username` - Telegram username (optional, can change)
- `photo_url` - Profile photo URL
- `auth_date` - Unix timestamp of authentication
- `hash` - HMAC-SHA256 hash for verification

**Special Considerations**:
1. **No Email** - Telegram doesn't provide email addresses
2. **Widget-Based** - Uses JavaScript widget, not traditional OAuth redirect
3. **HMAC Verification** - Must verify hash using bot token as secret key
4. **No Tokens** - No access/refresh tokens, each login is independent
5. **Username Can Change** - Don't use username as identifier, use ID only
6. **Photo URL Expires** - Profile photo URLs expire, must re-fetch periodically

**No Token Lifetime** (widget provides one-time authentication data)

**Required Configuration**:
```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz123456789
TELEGRAM_BOT_USERNAME=nxloy_bot
```

**Implementation Notes**:
- Verify hash: HMAC-SHA256(data_check_string, SHA256(bot_token))
- Check auth_date is recent (within 24 hours)
- Prompt user for email after Telegram login (required for platform)
- Don't rely on username (can change or be removed)
- Store photo_url but be prepared to re-fetch

**HMAC Verification Algorithm**:
```
1. Create data_check_string: sorted key=value pairs (except hash), joined by \n
2. Calculate secret_key: SHA256(bot_token)
3. Calculate hash: HMAC-SHA256(data_check_string, secret_key)
4. Compare calculated hash with provided hash (constant-time comparison)
```

### Email/Password (Traditional Auth)

**Not OAuth** - Traditional credential-based authentication as fallback.

**Required Fields**:
- Email address (verified)
- Password (hashed with bcrypt or Argon2)

**Special Considerations**:
1. **Password Hashing** - Use bcrypt (cost 12) or Argon2id
2. **Email Verification** - Must verify email before account is fully active
3. **Password Reset** - Implement secure password reset flow with time-limited tokens
4. **Rate Limiting** - Limit login attempts (5 per hour per email)
5. **No Tokens** - Session-based, no OAuth tokens

**Implementation Notes**:
- Store password hash in User.passwordHash (not Account table)
- Use bcrypt.hash(password, 12) or argon2.hash(password)
- Implement password strength requirements (min 8 chars, complexity)
- Support password change (requires current password verification)
- Create Account record with provider="email" for consistency

---

## Security Considerations

### 1. Token Storage and Encryption

**Requirement**: All OAuth tokens MUST be encrypted at rest.

**Implementation**:
- Use AES-256-GCM encryption for all tokens
- Encryption key stored in environment variable (never in code)
- Rotate encryption keys periodically (with re-encryption strategy)
- Decrypt tokens only when needed (in-memory, never logged)

**Fields to Encrypt**:
- Account.access_token
- Account.refresh_token
- Account.id_token

**Encryption Strategy**:
```
Plaintext Token -> AES-256-GCM(token, encryption_key, random_iv) -> Base64 -> Database
Database -> Base64 Decode -> AES-256-GCM Decrypt(encrypted, key, iv) -> Plaintext Token
```

### 2. PKCE (Proof Key for Code Exchange)

**Requirement**: All OAuth flows MUST use PKCE.

**Providers Requiring PKCE**:
- Google (required)
- Apple (recommended, soon required)
- Facebook (recommended)

**Implementation**:
1. Generate random code_verifier (43-128 chars, URL-safe)
2. Calculate code_challenge: Base64URL(SHA256(code_verifier))
3. Send code_challenge in authorization request
4. Send code_verifier in token exchange request
5. Provider verifies: SHA256(code_verifier) == code_challenge

**Why PKCE?**
- Prevents authorization code interception attacks
- Required for public clients (mobile apps, SPAs)
- Security best practice even for confidential clients

### 3. Account Linking Security

**Requirement**: Users can link OAuth providers to existing accounts, but only with verification.

**Security Rules**:
1. **Email Verification Required** - If linking provider email matches existing user email, require email verification
2. **Confirmation Required** - User must explicitly confirm account linking
3. **Existing Session Required** - Can only link providers while logged in
4. **Rate Limiting** - Limit linking attempts (3 per hour)

**Attack Prevention**:
- **Pre-Account Takeover (PATO)**: Attacker creates account with victim's email from unverified provider, then links verified provider when victim signs up
  - **Mitigation**: Always verify email before auto-linking accounts

- **Account Linking Attacks**: Attacker tricks victim into linking attacker's OAuth account
  - **Mitigation**: Require user confirmation + show provider email before linking

**Implementation Flow**:
```
1. User logged in as user@example.com (password-based)
2. User clicks "Link Google Account"
3. User completes Google OAuth (returns email: user@example.com)
4. System detects email match
5. System sends verification email to user@example.com
6. User clicks verification link
7. System links Google account to existing user
```

### 4. State Parameter for CSRF Protection

**Requirement**: All OAuth flows MUST use state parameter.

**Implementation**:
1. Generate random state value (cryptographically secure)
2. Store state in session or encrypted cookie
3. Send state in authorization request
4. Verify state in callback matches stored value
5. Reject request if state doesn't match or is missing

**Why State?**
- Prevents CSRF attacks on OAuth callback
- Ensures authorization response corresponds to request
- Can encode additional data (return URL, etc.)

### 5. Token Refresh Strategy

**Requirement**: Refresh tokens before expiration to maintain seamless UX.

**Implementation**:
- Background job checks expiring tokens (expires_at < now + 5 minutes)
- Automatically refresh using refresh_token
- Update Account record with new tokens
- Log refresh failures for monitoring

**Providers with Refresh Tokens**:
- Apple: 6 months (refresh proactively)
- Google: No expiration (refresh when access token expires)
- Facebook: No refresh tokens (extend long-lived tokens)

### 6. Session Security

**Requirements**:
- Session tokens must be cryptographically random (32+ bytes)
- Sessions stored server-side (not client-side JWT)
- HttpOnly cookies (prevent XSS access)
- Secure flag (HTTPS only)
- SameSite=Lax or Strict (prevent CSRF)

**Implementation**:
```
Set-Cookie: session_token=abc123...xyz; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
```

### 7. Rate Limiting

**Requirements**:
- Login attempts: 5 per hour per email
- OAuth authorization: 10 per hour per user
- Account linking: 3 per hour per user
- Token refresh: 100 per hour per user (automated)
- Email verification: 5 per hour per email

**Implementation**: Use Redis for distributed rate limiting.

---

## User Flows

### Flow 1: First-Time OAuth Sign Up

**Scenario**: User has never used NxLoy, signs up with Google.

**Steps**:
1. User clicks "Continue with Google"
2. System generates PKCE code_verifier and code_challenge
3. System generates random state value, stores in session
4. System redirects to Google authorization URL with:
   - client_id, redirect_uri, scope
   - state (CSRF protection)
   - code_challenge, code_challenge_method=S256 (PKCE)
5. User authenticates with Google, grants permissions
6. Google redirects back to callback URL with:
   - code (authorization code)
   - state (must match)
7. System verifies state matches stored value
8. System exchanges code for tokens (sends code_verifier)
9. System receives: access_token, refresh_token, id_token
10. System decodes id_token, extracts user claims (sub, email, name, picture)
11. System checks if Account exists with provider="google" and providerAccountId=sub
12. **Account doesn't exist** -> New user
13. System checks if User exists with matching email
14. **User doesn't exist** -> Create new User
15. System creates User record:
    - email from Google
    - emailVerified = now (Google verifies emails)
    - firstName, lastName from Google
    - avatarUrl from Google picture
16. System creates Account record:
    - userId = new User ID
    - provider = "google"
    - providerAccountId = sub from Google
    - access_token, refresh_token, id_token (encrypted)
    - expires_at = now + 3600 (Google tokens expire in 1 hour)
17. System creates Session record:
    - userId = new User ID
    - sessionToken = random secure token
    - expires = now + 7 days
18. System sets session cookie
19. System redirects to onboarding flow (new user)

**Result**: New user account created and logged in.

### Flow 2: Returning OAuth User Login

**Scenario**: User previously signed up with Google, logging in again.

**Steps**:
1-9. Same as Flow 1 (OAuth authorization and token exchange)
10. System decodes id_token, extracts user claims
11. System checks if Account exists with provider="google" and providerAccountId=sub
12. **Account exists** -> Existing user
13. System retrieves User record via Account.userId
14. System updates Account tokens (access_token, refresh_token, expires_at)
15. System creates new Session record
16. System sets session cookie
17. System redirects to dashboard (returning user)

**Result**: Existing user logged in, tokens refreshed.

### Flow 3: Linking Additional Provider to Existing Account

**Scenario**: User logged in with email/password, wants to link Google account.

**Steps**:
1. User already logged in (has active Session)
2. User navigates to Settings > Connected Accounts
3. User clicks "Link Google Account"
4-9. Same OAuth flow (authorization and token exchange)
10. System decodes id_token, extracts user claims (sub, email)
11. System checks if Account exists with provider="google" and providerAccountId=sub
12. **Account exists for DIFFERENT user** -> Error (account already linked elsewhere)
13. **Account doesn't exist** -> Can link
14. System compares Google email with logged-in user's email
15. **Emails match** -> Requires verification
16. System generates verification token
17. System sends email to user: "Confirm linking Google account"
18. User clicks verification link in email
19. System verifies token is valid and not expired
20. System creates Account record:
    - userId = current User ID
    - provider = "google"
    - providerAccountId = sub
    - tokens (encrypted)
21. System shows success message: "Google account linked"

**Result**: Google account linked to existing user.

### Flow 4: Email Match with Different Account (Auto-Merge Consideration)

**Scenario**: User signs up with Apple (email: user@example.com), but account with that email already exists from Facebook.

**Option A: Manual Linking (Recommended)**
1-10. Same as Flow 1 (OAuth flow, token exchange)
11. System extracts email from Apple ID token: user@example.com
12. System checks if Account exists with provider="apple" and providerAccountId=sub
13. **Account doesn't exist** -> New provider
14. System checks if User exists with email=user@example.com
15. **User exists** -> Email conflict
16. System shows message: "An account with this email already exists. Log in to link your Apple account."
17. User logs in with existing Facebook account
18. User navigates to Settings > Connected Accounts
19. User completes account linking flow (Flow 3)

**Option B: Auto-Merge with Verification (Advanced)**
1-15. Same as Option A
16. System sends verification email to user@example.com
17. Email: "Someone tried to sign in with Apple using your email. Click to link accounts."
18. User clicks link
19. System creates Account record for Apple
20. System links Apple account to existing User
21. User logged in

**NxLoy Recommendation**: Option A (manual linking) for security and user clarity.

### Flow 5: Unlinking Provider

**Scenario**: User has Google and Facebook linked, wants to unlink Facebook.

**Steps**:
1. User logged in, navigates to Settings > Connected Accounts
2. User sees list of linked accounts:
   - Google (user@example.com)
   - Facebook (user@example.com)
3. User clicks "Unlink" next to Facebook
4. System checks unlinking constraints:
   - Count linked accounts: 2
   - User has password set: No
   - **Constraint**: Cannot unlink if it's the last auth method and no password
5. **Constraint not violated** (has Google account remaining)
6. System shows confirmation: "Are you sure? You won't be able to log in with Facebook."
7. User confirms
8. System revokes Facebook token (optional, best practice)
9. System deletes Account record for Facebook
10. System shows success: "Facebook account unlinked"

**Result**: Facebook account unlinked, user can still log in with Google.

**Edge Case**: Attempting to unlink last provider without password
- System shows error: "Cannot unlink. Set a password first or link another account."

### Flow 6: Telegram Login (Requires Email Collection)

**Scenario**: User signs in with Telegram (which doesn't provide email).

**Steps**:
1. User clicks "Continue with Telegram"
2. Telegram widget opens
3. User authorizes in Telegram app
4. Widget callback provides: id, first_name, last_name, username, photo_url, auth_date, hash
5. System verifies HMAC hash using bot token
6. System checks auth_date is recent (within 24 hours)
7. System checks if Account exists with provider="telegram" and providerAccountId=id
8. **Account doesn't exist** -> New user
9. **Telegram doesn't provide email** -> Must collect
10. System creates temporary pending user record (or session data)
11. System shows form: "Enter your email to complete signup"
12. User enters email: user@example.com
13. System checks if User exists with that email
14. **User exists** -> Email conflict (handle like Flow 4)
15. **User doesn't exist** -> Create new User
16. System sends verification email
17. User clicks verification link
18. System creates User record:
    - email = user@example.com
    - emailVerified = now
    - firstName from Telegram
    - lastName from Telegram
    - avatarUrl from Telegram photo_url
19. System creates Account record:
    - userId = new User ID
    - provider = "telegram"
    - providerAccountId = Telegram id
    - No tokens (Telegram doesn't use OAuth tokens)
20. System creates Session record
21. User logged in

**Result**: New user created with Telegram + email.

---

## API Contracts

### Required REST Endpoints

These endpoints must be implemented in the authentication service.

#### POST /auth/signup/email

Register new user with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": null
  },
  "message": "Verification email sent to user@example.com"
}
```

#### POST /auth/login/email

Login with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "session": {
    "sessionToken": "session_abc123",
    "expiresAt": "2025-11-14T12:00:00Z"
  },
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "firstName": "John"
  }
}
```

**Sets Cookie**: `session_token=session_abc123; HttpOnly; Secure; SameSite=Lax`

#### GET /auth/oauth/:provider/authorize

Initiate OAuth flow for specified provider (google, apple, facebook, telegram).

**Parameters**:
- `provider`: "google" | "apple" | "facebook" | "telegram"
- `redirect_uri` (optional): Where to redirect after successful auth

**Response** (302 Redirect):
- Redirects to provider's authorization URL with state and PKCE parameters

#### GET /auth/oauth/:provider/callback

OAuth callback endpoint (provider redirects here after user authorizes).

**Query Parameters**:
- `code`: Authorization code
- `state`: CSRF protection state (must match)

**Response** (302 Redirect):
- On success: Redirects to app with session cookie set
- On error: Redirects to login page with error message

#### POST /auth/oauth/link/:provider

Link additional OAuth provider to logged-in user's account.

**Requires**: Active session (authenticated)

**Parameters**:
- `provider`: "google" | "apple" | "facebook" | "telegram"

**Response** (200 OK):
```json
{
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "message": "Complete authorization to link Google account"
}
```

#### DELETE /auth/oauth/unlink/:provider

Unlink OAuth provider from user's account.

**Requires**: Active session (authenticated)

**Request**:
```json
{
  "provider": "facebook"
}
```

**Response** (200 OK):
```json
{
  "message": "Facebook account unlinked successfully"
}
```

**Response** (400 Bad Request) if constraint violated:
```json
{
  "error": "Cannot unlink last authentication method. Set a password first."
}
```

#### GET /auth/me

Get current user profile and linked accounts.

**Requires**: Active session (authenticated)

**Response** (200 OK):
```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://..."
  },
  "accounts": [
    {
      "provider": "google",
      "providerAccountId": "12345",
      "email": "user@example.com"
    },
    {
      "provider": "facebook",
      "providerAccountId": "67890",
      "email": "user@example.com"
    }
  ],
  "hasPassword": false
}
```

#### POST /auth/logout

Logout (invalidate session).

**Requires**: Active session (authenticated)

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

**Clears Cookie**: Removes `session_token` cookie

#### POST /auth/verify-email

Verify email address with token from email.

**Request**:
```json
{
  "token": "verification_token_123"
}
```

**Response** (200 OK):
```json
{
  "message": "Email verified successfully"
}
```

#### POST /auth/resend-verification

Resend email verification.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Verification email sent"
}
```

---

## Edge Cases and Error Handling

### 1. Email Changes on Provider Side

**Problem**: User changes email in Google account from user@example.com to newuser@example.com.

**Detection**: Next login, Google returns new email in ID token.

**Handling**:
1. System detects Account exists but email in token differs from User.email
2. System checks if newuser@example.com is already used by another User
3. **If available**: Update User.email (after verification)
4. **If taken**: Show error, ask user to contact support
5. Log email change event for audit

**Recommendation**: Send notification to old email about email change.

### 2. Provider Account Deletion

**Problem**: User deletes their Google account, then tries to log in to NxLoy.

**Detection**: OAuth flow fails (Google returns error: user_not_found or invalid_grant).

**Handling**:
1. System shows error: "Google account no longer available"
2. If user has other linked accounts: "Log in with Facebook instead"
3. If user has no other accounts and no password: "Contact support to recover account"
4. Log event for security audit

**Recommendation**: Periodically check token validity, notify users of expiring/invalid tokens.

### 3. Multiple Accounts with Same Email (Rare)

**Problem**: User creates account with email@example.com via Facebook (unverified email on Facebook). Later, user signs up with Google using same email (verified).

**Detection**: Google OAuth returns verified email that matches existing User record created via Facebook.

**Handling** (Option A - Recommended):
1. System shows: "An account with this email already exists. Log in to link accounts."
2. User logs in with Facebook
3. User links Google account (Flow 3)

**Handling** (Option B - Auto-Merge with Verification):
1. System sends verification email
2. User verifies ownership of email
3. System merges accounts (keeps User record, adds new Account record)

**NxLoy Recommendation**: Option A for clarity and security.

### 4. Provider Deprecation or Service Outage

**Problem**: Facebook Login is down or deprecated.

**Detection**: OAuth authorization or token refresh fails with service error.

**Handling**:
1. System shows friendly error: "Facebook Login temporarily unavailable"
2. Offer alternative: "Try logging in with Google or email/password"
3. Log errors for monitoring
4. If provider is being deprecated: Notify all affected users, prompt to link alternative provider

**Recommendation**: Monitor provider status pages, notify users proactively.

### 5. Token Expiration During Active Session

**Problem**: User's Google access token expires while they're actively using the app.

**Detection**: API call to Google fails with invalid_token error.

**Handling**:
1. System checks if refresh_token exists
2. **If yes**: Automatically refresh access token
3. **If no**: Session remains valid (user stays logged in), but can't access Google APIs
4. System logs token refresh event

**Recommendation**: Proactively refresh tokens before expiration (background job).

### 6. Race Condition: Simultaneous Logins

**Problem**: User logs in with Google on desktop and mobile simultaneously.

**Detection**: Two OAuth callback requests arrive within seconds.

**Handling**:
1. Both requests create separate Session records (allowed)
2. Account tokens are updated by whichever request completes last
3. Both sessions remain valid
4. User is logged in on both devices

**Recommendation**: No special handling needed (expected behavior).

### 7. Partial Data from Provider

**Problem**: Apple returns minimal data (no email, using private relay).

**Detection**: ID token contains is_private_email=true and email is relay address.

**Handling**:
1. Accept private relay email as valid email
2. User can later update to personal email if desired
3. Don't show "Email not verified" (Apple always verifies)

**Recommendation**: Treat private relay emails as first-class citizens.

### 8. User Revokes App Access on Provider

**Problem**: User goes to Google Account settings, revokes NxLoy app access.

**Detection**: Token refresh fails with invalid_grant error.

**Handling**:
1. System marks Account as invalid (set revoked_at timestamp)
2. User session remains valid (can still access NxLoy)
3. User can't use "Login with Google" until they re-authorize
4. Next login attempt shows: "Re-authorize Google account"

**Recommendation**: Don't delete Account record (preserve providerAccountId for re-linking).

---

## Implementation Guidelines

### For Backend Developers

1. **Use Industry-Standard Libraries**:
   - NestJS: `@nestjs/passport`, `passport-google-oauth20`, `passport-apple`, `passport-facebook`
   - Token encryption: `crypto` module (built-in Node.js)
   - Password hashing: `bcrypt` or `@node-rs/argon2`

2. **Environment Variables**:
   - Store all OAuth credentials in `.env` (never in code)
   - Use separate credentials for dev/staging/production
   - Rotate secrets regularly

3. **Error Handling**:
   - Never expose OAuth errors to users (security risk)
   - Log all OAuth errors for debugging
   - Show user-friendly generic error messages

4. **Testing**:
   - Use factories to create test Users and Accounts (per CLAUDE.md)
   - Use Faker for realistic test data
   - Test all edge cases (expired tokens, revoked access, etc.)
   - Test account linking and unlinking flows

5. **Security Checklist**:
   - [ ] All tokens encrypted at rest (AES-256-GCM)
   - [ ] PKCE implemented for all OAuth flows
   - [ ] State parameter verified on all callbacks
   - [ ] Rate limiting on all auth endpoints
   - [ ] Session cookies are HttpOnly, Secure, SameSite
   - [ ] Email verification required for account linking
   - [ ] Audit logging for all auth events

### For Frontend Developers

1. **OAuth Buttons**:
   - Use provider's official branding guidelines
   - Apple: "Sign in with Apple" (specific button styles required)
   - Google: "Sign in with Google" (Google One Tap recommended)
   - Facebook: "Continue with Facebook"
   - Telegram: Use official Telegram Login Widget

2. **User Feedback**:
   - Show loading state during OAuth redirect
   - Handle OAuth errors gracefully (show retry option)
   - Explain account linking clearly before initiating
   - Show list of linked accounts in settings

3. **Mobile Considerations**:
   - iOS: Use ASWebAuthenticationSession for OAuth (WKWebView deprecated)
   - iOS: Use native Sign in with Apple for best UX
   - Android: Use Custom Tabs for OAuth
   - Deep link handling for OAuth callbacks

### For DevOps

1. **OAuth Callback URLs**:
   - Register all environment callback URLs with providers:
     - Dev: `http://localhost:8000/api/auth/callback/:provider`
     - Staging: `https://staging.nxloy.com/api/auth/callback/:provider`
     - Prod: `https://app.nxloy.com/api/auth/callback/:provider`

2. **Monitoring**:
   - Alert on high OAuth failure rates
   - Monitor token refresh failures
   - Track provider API response times

3. **Secrets Management**:
   - Use secret management service (AWS Secrets Manager, HashiCorp Vault)
   - Rotate OAuth client secrets annually
   - Audit secret access logs

---

## Migration Strategy

### From Single-Provider to Multi-Provider

If you already have users with single OAuth provider (e.g., Google only):

#### Step 1: Schema Migration

1. Backup current database
2. Add Account table (new schema)
3. Migrate existing User records:
   - For each User with oauthProvider and oauthId:
     - Create Account record:
       - provider = User.oauthProvider
       - providerAccountId = User.oauthId
       - userId = User.id
4. Deprecated fields can remain for rollback (mark as nullable)

#### Step 2: Code Migration

1. Update authentication middleware to check Account table
2. Update login flow to create Account records
3. Add account linking endpoints
4. Update user settings page to show linked accounts

#### Step 3: Testing

1. Test existing users can still log in
2. Test new users can sign up with any provider
3. Test account linking works
4. Load test authentication endpoints

#### Step 4: Rollout

1. Deploy to staging, test thoroughly
2. Run migration on production database (off-peak hours)
3. Deploy new code
4. Monitor error rates for 24 hours
5. If successful, remove deprecated fields after 30 days

---

## Appendix

### Glossary

- **OAuth**: Open Authorization standard for delegated access
- **OIDC**: OpenID Connect, identity layer on top of OAuth 2.0
- **PKCE**: Proof Key for Code Exchange, security extension for OAuth
- **Provider**: Third-party service providing authentication (Google, Apple, etc.)
- **Account**: Link between User and OAuth provider
- **Session**: Active login session for a user
- **Access Token**: Short-lived token for API access
- **Refresh Token**: Long-lived token to get new access tokens
- **ID Token**: JWT containing user identity claims (OIDC)
- **Sub**: Subject claim, unique user identifier from provider

### References

- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)
- [OIDC Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [PKCE RFC](https://datatracker.ietf.org/doc/html/rfc7636)
- [Apple Sign In Docs](https://developer.apple.com/sign-in-with-apple/)
- [Google Sign In Docs](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Docs](https://developers.facebook.com/docs/facebook-login)
- [Telegram Login Widget](https://core.telegram.org/widgets/login)
- [NextAuth.js Prisma Adapter](https://authjs.dev/reference/adapter/prisma)

---

**Document Status**: Draft - Ready for Review
**Next Steps**:
1. Review by security team
2. Review by backend team
3. Finalize provider list (add/remove as needed)
4. Create implementation tasks (see `/docs/tasks/features/phase-1-foundation.md`)

