# Authentication API Documentation

## Overview

Complete authentication API with email/password, OAuth, 2FA/MFA, RBAC, and security features.

**Base URL:** `http://localhost:8080/api`

**Authentication:** Bearer token in `Authorization` header

---

## Authentication Endpoints

### POST /auth/signup
Create new user account with email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "locale": "EN",
  "timezone": "America/New_York"
}
```

**Response:** `201 Created`
```json
{
  "id": "cuid...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-11-11T10:00:00Z"
}
```

**Validation:**
- Password: Min 8 chars, uppercase, lowercase, number, special char
- Email: Valid email format
- Names: Max 50 chars

**Side Effects:**
- Sends email verification PIN
- Creates audit log entry

---

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": "7d"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `401 Unauthorized` - Account locked (includes unlock time)

**Security:**
- Checks account lockout status
- Records login attempt (success/failure)
- Increments failed attempts counter
- Locks account after 5 failed attempts (30 min lockout)

---

### POST /auth/refresh
Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": "7d"
}
```

**Security:**
- Token rotation (old refresh token revoked)
- Token family tracking

---

### POST /auth/logout
Logout and revoke tokens.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `204 No Content`

**Side Effects:**
- Revokes refresh tokens
- Revokes session (if sessionId present)

---

### POST /auth/forgot-password
Request password reset PIN.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Side Effects:**
- Sends password reset email with PIN
- Creates verification token (15 min expiry)

**Security:**
- Does not reveal if email exists

---

### POST /auth/reset-password
Reset password with PIN verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "pin": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

**Side Effects:**
- Updates password hash
- Revokes all refresh tokens (logout everywhere)
- Creates audit log entry

---

### GET /auth/me
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "userId": "cuid...",
  "email": "user@example.com",
  "sessionId": "session-id"
}
```

---

## OAuth Endpoints

### GET /auth/google
Initiates Google OAuth flow.

**Response:** Redirects to Google consent screen

---

### GET /auth/google/callback
Google OAuth callback (handled automatically).

**Response:** Redirects to frontend with tokens
```
http://localhost:3001/auth/callback?accessToken=...&refreshToken=...&expiresIn=7d
```

---

### GET /auth/apple
Initiates Apple OAuth flow.

**Response:** Redirects to Apple consent screen

---

### GET /auth/apple/callback
Apple OAuth callback (handled automatically).

---

### GET /auth/facebook
Initiates Facebook OAuth flow.

**Response:** Redirects to Facebook consent screen

---

### GET /auth/facebook/callback
Facebook OAuth callback (handled automatically).

---

## MFA Endpoints

### GET /mfa/setup-totp
Get TOTP setup data (QR code, secret, backup codes).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "data:image/png;base64,...",
  "backupCodes": [
    "A3F2B8D1",
    "C9E4F6A2",
    "..."
  ]
}
```

---

### POST /mfa/enable-totp
Enable TOTP after verifying code.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### POST /mfa/disable
Disable all MFA methods.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### POST /mfa/verify
Verify MFA code during login.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "method": "TOTP",
  "code": "123456"
}
```

**Methods:** `TOTP`, `BACKUP_CODE`, `EMAIL`, `SMS`

**Response:** `200 OK`
```json
{
  "success": true,
  "method": "TOTP"
}
```

---

### POST /mfa/regenerate-backup-codes
Generate new backup codes (invalidates old ones).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "backupCodes": [
    "A3F2B8D1",
    "C9E4F6A2",
    "..."
  ]
}
```

---

## Verification Endpoints

### POST /verification/request
Request verification PIN.

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "type": "EMAIL_VERIFICATION",
  "userId": "cuid..."
}
```

**Types:**
- `EMAIL_VERIFICATION`
- `PHONE_VERIFICATION`
- `PASSWORD_RESET`
- `ACCOUNT_LINKING`
- `TWO_FACTOR_AUTH`
- `PHONE_NUMBER_CHANGE`

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### POST /verification/verify
Verify PIN code.

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "pin": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "uuid-token"
}
```

---

### GET /verification/verify-token
Verify email link token (fallback to PIN).

**Query Parameters:**
- `token` - UUID token from email link

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

## RBAC Endpoints

### POST /rbac/roles
Create new role (SUPER_ADMIN only).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "CUSTOM_ROLE",
  "description": "Custom role description",
  "isSystem": false,
  "permissionIds": ["perm-id-1", "perm-id-2"]
}
```

**Response:** `201 Created`

---

### GET /rbac/roles
Get all roles.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
[
  {
    "id": "role-id",
    "name": "SUPER_ADMIN",
    "description": "Full system access",
    "isSystem": true,
    "permissions": [...]
  }
]
```

---

### POST /rbac/users/:userId/roles
Assign role to user.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "roleId": "role-id",
  "scopeType": "business",
  "scopeId": "business-id"
}
```

**Response:** `201 Created`

---

### GET /rbac/me/roles
Get current user's roles.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
[
  {
    "id": "user-role-id",
    "roleId": "role-id",
    "role": {
      "name": "BUSINESS_OWNER",
      "permissions": [...]
    }
  }
]
```

---

## User Profile Endpoints

### GET /user/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "id": "cuid...",
  "email": "user@example.com",
  "emailVerified": "2025-11-11T10:00:00Z",
  "firstName": "John",
  "lastName": "Doe",
  "avatarUrl": "https://...",
  "locale": "EN",
  "timezone": "America/New_York",
  "status": "ACTIVE",
  "mfaEnabled": true,
  "createdAt": "2025-11-11T10:00:00Z",
  "lastLoginAt": "2025-11-11T12:00:00Z"
}
```

---

### PUT /user/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "avatarUrl": "https://...",
  "timezone": "Europe/London",
  "locale": "EN"
}
```

**Response:** `200 OK` (updated profile)

---

### GET /user/sessions
Get active sessions.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
[
  {
    "id": "session-id",
    "userId": "user-id",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2025-11-11T10:00:00Z",
    "expiresAt": "2025-11-18T10:00:00Z"
  }
]
```

---

### DELETE /user/sessions/:id
Revoke specific session.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### DELETE /user/sessions
Revoke all sessions except current (logout everywhere).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "ThrottlerException"
}
```

---

## Rate Limits

**Global:** 100 requests per 60 seconds

**Per Endpoint:**
- Login: 5 attempts per 60 seconds
- Signup: 3 attempts per 60 seconds
- Password Reset: 3 attempts per 60 seconds
- PIN Request: 3 attempts per 60 seconds

**Account Lockout:**
- Threshold: 5 failed login attempts
- Duration: 30 minutes (configurable)

---

## Security Headers

All responses include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- `Content-Security-Policy`
- And more via Helmet

---

## Environment Variables

See `.env.example` for complete configuration options.

**Required:**
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`

**Optional OAuth:**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
