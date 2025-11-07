# PIN-Based Verification Specification

**Version**: 1.0.0
**Status**: Draft
**Last Updated**: 2025-11-07
**Author**: Ploy Lab (NxLoy Platform)

---

## Table of Contents

1. [Overview](#overview)
2. [Why PIN Instead of Email Links](#why-pin-instead-of-email-links)
3. [PIN Verification Types](#pin-verification-types)
4. [PIN Generation and Storage](#pin-generation-and-storage)
5. [Security Considerations](#security-considerations)
6. [User Flows](#user-flows)
7. [Database Schema](#database-schema)
8. [API Contracts](#api-contracts)
9. [Implementation Guidelines](#implementation-guidelines)
10. [Edge Cases](#edge-cases)

---

## Overview

### NxLoy Verification Strategy

**Primary Method: PIN Codes** (Promoted, recommended for all users)
**Fallback Method: Email Links** (Available but not promoted)

### Problem with Email Links

Traditional email verification and password reset use clickable links:
- ✉️ "Click here to verify your email"
- ✉️ "Click here to reset your password"

**Issues on Mobile**:
1. **Browser Switching** - Link opens in email app's browser, not main browser (loses session)
2. **App-to-Browser** - Opens unfriendly browser instead of staying in app
3. **Deep Link Complexity** - Requires complex deep link configuration
4. **Poor UX** - User leaves your app, completes action in browser, must return to app
5. **Link Expiration Confusion** - User doesn't know if link is still valid

### Solution: PIN-Based Verification (Primary Method)

**NxLoy promotes PIN codes as the primary verification method.** We send **6-digit PIN codes**:
- ✉️ "Your verification code is: **123456**"
- 📱 "Your verification code is: **123456**"

**Benefits**:
1. **Stay in App** - User stays in your mobile app or web app
2. **Mobile Friendly** - Easy to copy-paste or type 6 digits
3. **SMS Friendly** - Works great for SMS verification
4. **Clear Expiry** - Show countdown timer "Code expires in 9:45"
5. **Better UX** - No browser switching, no deep links, seamless flow

**Email links are still provided** as a fallback option for users who prefer them or have accessibility needs, but the UI/UX should prominently feature PIN code entry.

---

## Why PIN Instead of Email Links

### Comparison Table

| Feature | Email Links | PIN Codes |
|---------|-------------|-----------|
| **Mobile UX** | Poor (browser switching) | Excellent (stay in app) |
| **SMS Support** | No (links truncated) | Yes (perfect for SMS) |
| **Copy-Paste** | No | Yes |
| **Expiry Clarity** | Hidden (must click to check) | Clear (shown in message) |
| **Deep Links** | Required (complex) | Not needed |
| **Security** | Moderate (link in email) | High (PIN + device + rate limiting) |
| **Accessibility** | Requires clicking | Can be dictated/typed |
| **Offline Viewing** | Link may break | PIN works anytime |

### When to Use Each

**Primary Method - PIN Codes** (Promoted in UI, default option):
- ✅ Email verification during signup
- ✅ Phone verification
- ✅ Password reset
- ✅ Account linking confirmation
- ✅ Two-factor authentication (2FA)
- ✅ Transaction confirmation

**Secondary Method - Email Links** (Available but not promoted):
- Available as fallback for all PIN flows above (small "Use link instead" option)
- Magic link login (passwordless)
- Unsubscribe from emails
- Account deletion confirmation

**NxLoy Strategy**:
1. **UI promotes PIN codes** - PIN entry field is prominent, email link option is small/secondary
2. **Both methods work** - System sends both PIN code and verification link in same email
3. **Mobile optimized** - PIN codes provide better mobile UX
4. **Accessibility** - Email links available for users who need them

---

## PIN Verification Types

### 1. Email Verification (Signup)

**Use Case**: User signs up with email, needs to verify ownership.

**Flow**:
1. User enters email during signup
2. System sends 6-digit PIN to email
3. User enters PIN in app
4. System verifies PIN matches
5. Email marked as verified

**Expiry**: 15 minutes
**Max Attempts**: 5 attempts per PIN
**Rate Limit**: 3 PINs per email per hour

### 2. Phone Verification (Signup / Profile Update)

**Use Case**: User adds phone number, needs to verify via SMS.

**Flow**:
1. User enters phone number
2. System sends 6-digit PIN via SMS
3. User enters PIN in app
4. System verifies PIN matches
5. Phone marked as verified

**Expiry**: 10 minutes (SMS faster delivery)
**Max Attempts**: 5 attempts per PIN
**Rate Limit**: 3 PINs per phone per hour

### 3. Password Reset

**Use Case**: User forgot password, needs to reset securely.

**Flow**:
1. User enters email on "Forgot Password" page
2. System sends 6-digit PIN to email
3. User enters PIN in app
4. System verifies PIN matches
5. User sets new password
6. System logs user in with new password

**Expiry**: 15 minutes
**Max Attempts**: 5 attempts per PIN
**Rate Limit**: 3 PINs per email per hour

**Security Note**: PIN must be single-use even if not expired.

### 4. Account Linking Confirmation

**Use Case**: User wants to link Google account to existing email account, needs to confirm it's them.

**Flow**:
1. User initiates account linking
2. System sends 6-digit PIN to user's registered email
3. User enters PIN in app
4. System verifies PIN matches
5. Accounts linked

**Expiry**: 10 minutes
**Max Attempts**: 3 attempts per PIN
**Rate Limit**: 3 PINs per email per hour

### 5. Two-Factor Authentication (2FA)

**Use Case**: User has 2FA enabled, needs to enter code on login.

**Flow**:
1. User enters email + password
2. System sends 6-digit PIN to email or SMS (user's preference)
3. User enters PIN in app
4. System verifies PIN matches
5. User logged in

**Expiry**: 5 minutes (shorter for security)
**Max Attempts**: 3 attempts per PIN
**Rate Limit**: 5 PINs per user per hour

### 6. Sensitive Transaction Confirmation

**Use Case**: User attempts sensitive action (delete account, large redemption), requires confirmation.

**Flow**:
1. User initiates sensitive action
2. System sends 6-digit PIN to email
3. User enters PIN to confirm
4. System verifies PIN matches
5. Action executed

**Expiry**: 5 minutes
**Max Attempts**: 3 attempts per PIN
**Rate Limit**: 3 PINs per action per hour

---

## PIN Generation and Storage

### PIN Format

**Specification**:
- Length: 6 digits
- Characters: 0-9 only
- Format: `123456` (no spaces, no separators)

**Why 6 Digits?**
- Security: 1 million possible combinations (10^6)
- Usability: Easy to remember and type
- Standard: Used by Google, Apple, banks, etc.

**Alternative**: 4 digits (10,000 combinations) - Use only for low-security contexts like Telegram-style login.

### Generation Algorithm

**Requirements**:
- Cryptographically secure random number generator
- Evenly distributed (no bias toward certain numbers)
- Unique per request (no duplicates in active window)

**Implementation** (pseudo-code):
```
Generate PIN:
1. Generate 6 random bytes using crypto.randomBytes(6)
2. Convert to integer: parseInt(bytes.toString('hex'), 16)
3. Modulo 1000000: integer % 1000000
4. Pad with leading zeros: pin.toString().padStart(6, '0')
5. Result: "000123" to "999999"

Example:
Random bytes: [0x1A, 0x2B, 0x3C, 0x4D, 0x5E, 0x6F]
Hex string: "1a2b3c4d5e6f"
Integer: 28634522411631
Modulo: 411631
Padded: "411631"
```

### Storage

**Requirements**:
- Hash PINs before storing (like passwords)
- Never store plaintext PINs in database
- Use fast hashing (bcrypt cost 8, or SHA-256)

**Database Fields**:
- `identifier` - Email or phone being verified
- `pinHash` - Hashed PIN (bcrypt or SHA-256 + salt)
- `type` - Verification type (email, phone, password-reset, etc.)
- `attempts` - Number of failed attempts (max 3-5)
- `expiresAt` - Expiration timestamp
- `usedAt` - Timestamp when PIN was successfully used (null if unused)
- `createdAt` - When PIN was created

**Hashing Strategy**:

**Option A: bcrypt** (Recommended for high-security)
```
PIN: "123456"
Hash: bcrypt.hash("123456", 8)
Result: "$2b$08$xyz..." (stored in database)
Verify: bcrypt.compare(userInput, storedHash)
```

**Option B: SHA-256 + Salt** (Faster, sufficient for PINs)
```
PIN: "123456"
Salt: crypto.randomBytes(16).toString('hex')
Hash: SHA256(PIN + salt)
Store: {hash: "abc...", salt: "def..."}
Verify: SHA256(userInput + storedSalt) === storedHash
```

**NxLoy Recommendation**: SHA-256 + salt for PINs (faster verification, PINs are short-lived).

---

## Security Considerations

### 1. Rate Limiting

**Per Identifier** (email or phone):
- Maximum 3 PIN requests per hour
- After 3 requests, show: "Too many requests. Try again in 1 hour."

**Per IP Address**:
- Maximum 10 PIN requests per hour (across all identifiers)
- Prevents attacker from brute-forcing multiple accounts

**Per PIN** (attempts):
- Maximum 3-5 attempts per PIN code
- After max attempts, PIN is invalidated
- User must request new PIN

**Implementation**: Use Redis for distributed rate limiting.

```
Rate Limit Keys:
- pin:email:{email}:count -> expires in 1 hour
- pin:ip:{ip}:count -> expires in 1 hour
- pin:attempts:{pinId} -> expires with PIN
```

### 2. Expiration Times

| Verification Type | Expiry Time | Reason |
|-------------------|-------------|--------|
| Email Verification | 15 minutes | Generous for email delivery |
| Phone (SMS) Verification | 10 minutes | SMS delivers quickly |
| Password Reset | 15 minutes | User needs time to check email |
| 2FA Code | 5 minutes | Short for security |
| Transaction Confirmation | 5 minutes | Sensitive action |
| Account Linking | 10 minutes | Moderate security |

**Display to User**: Show countdown timer in UI.

### 3. Single-Use PINs

**Requirement**: Each PIN can only be used once, even if not expired.

**Implementation**:
1. On successful verification, set `usedAt` timestamp
2. Subsequent attempts with same PIN are rejected
3. Show error: "This code has already been used. Request a new code."

**Why**: Prevents replay attacks.

### 4. Brute Force Protection

**Attack**: Attacker tries all 1 million PIN combinations.

**Mitigations**:
1. **Attempt Limit**: Maximum 3-5 attempts per PIN
2. **Rate Limiting**: Can't request unlimited PINs
3. **Exponential Backoff**: After failed attempts, delay increases
4. **IP Blocking**: Block IPs with suspicious patterns
5. **CAPTCHA**: Show CAPTCHA after 2 failed PIN requests

**Math**:
- 1 million possible PINs
- 5 attempts per PIN
- 3 PINs per hour
- = 15 attempts per hour
- = 66,667 hours to try all PINs (7.6 years)

**Conclusion**: Brute force is impractical with proper rate limiting.

### 5. Phishing Protection

**Attack**: Attacker sends fake email/SMS claiming to be from NxLoy, asks user to reply with PIN.

**Mitigations**:
1. **Education**: In every PIN message, add: "Never share this code with anyone, including NxLoy staff."
2. **Short Expiry**: PIN expires quickly, reducing window for phishing
3. **Official Channels**: Only send PINs from verified email/SMS sender
4. **Branding**: Include NxLoy logo and "Official" badge in emails

**Example Message**:
```
Your NxLoy verification code is: 123456

This code expires in 15 minutes.
Never share this code with anyone, including NxLoy staff.

If you didn't request this code, ignore this message.
```

### 6. PIN Code Delivery

**Email**:
- Use transactional email service (SendGrid, Postmark, AWS SES)
- SPF, DKIM, DMARC configured to prevent spoofing
- From address: noreply@nxloy.com or verify@nxloy.com
- Subject: "Your NxLoy verification code"

**SMS**:
- Use SMS gateway (Twilio, AWS SNS, Vonage)
- Sender ID: "NXLOY" (alphanumeric sender ID where supported)
- Message: "Your NxLoy code is: 123456. Expires in 10 min. Never share this code."

### 7. Logging and Monitoring

**Log Events**:
- PIN requested (identifier, type, timestamp, IP)
- PIN verified successfully (identifier, type, timestamp, IP)
- PIN verification failed (identifier, type, attempts, IP)
- Rate limit exceeded (identifier or IP, timestamp)

**Alerts**:
- High failure rate (>10% failed verifications)
- Unusual request patterns (same IP, many identifiers)
- Single identifier with many requests

---

## User Flows

### Flow 1: Email Verification During Signup

**Scenario**: New user signs up with email, needs to verify.

**Steps**:
1. User fills signup form:
   - Email: user@example.com
   - Password: SecurePass123!
   - Name: John Doe
2. User submits form
3. System validates input
4. System creates User record (emailVerified = null)
5. System generates 6-digit PIN: "482719"
6. System hashes PIN: SHA256("482719" + salt)
7. System creates VerificationToken record:
   - identifier: user@example.com
   - pinHash: {hash}
   - type: EMAIL_VERIFICATION
   - attempts: 0
   - expiresAt: now + 15 minutes
8. System sends email:
   ```
   Subject: Verify your NxLoy account

   Your verification code is: 482719

   This code expires in 15 minutes.
   Enter this code in the app to verify your email.

   Never share this code with anyone, including NxLoy staff.
   ```
9. System shows PIN entry screen in app:
   - "Enter the 6-digit code sent to user@example.com"
   - Input field for 6 digits
   - "Resend code" button
   - Countdown timer: "Code expires in 14:58"
10. User receives email, opens it
11. User enters PIN: "482719"
12. System validates:
    - Check VerificationToken exists for user@example.com
    - Check type = EMAIL_VERIFICATION
    - Check not expired (expiresAt > now)
    - Check attempts < 5
    - Check usedAt is null (not already used)
    - Hash user input, compare with stored pinHash
13. **PIN matches** ✅
14. System updates:
    - User.emailVerified = now
    - VerificationToken.usedAt = now
15. System shows success: "Email verified! Welcome to NxLoy"
16. System logs user in (creates Session)
17. System redirects to dashboard

**Result**: User's email is verified, account is active.

### Flow 2: Phone Verification via SMS

**Scenario**: User wants to add and verify phone number.

**Steps**:
1. User logged in, navigates to Settings > Profile
2. User enters phone: +1-555-123-4567
3. User clicks "Verify Phone"
4. System generates 6-digit PIN: "951724"
5. System creates VerificationToken (type: PHONE_VERIFICATION)
6. System sends SMS via Twilio:
   ```
   Your NxLoy code is: 951724
   Expires in 10 min.
   Never share this code.
   ```
7. System shows PIN entry screen:
   - "Enter the code sent to +1-555-***-4567"
   - 6-digit input field
   - "Resend code" button
   - Timer: "9:58"
8. User receives SMS
9. User enters PIN: "951724"
10. System validates PIN (same as Flow 1)
11. **PIN matches** ✅
12. System updates:
    - User.phone = +15551234567 (E.164 format)
    - User.phoneVerified = now
13. System shows success: "Phone verified!"

**Result**: User's phone is verified.

### Flow 3: Password Reset

**Scenario**: User forgot password, needs to reset.

**Steps**:
1. User on login page, clicks "Forgot Password"
2. User enters email: user@example.com
3. User clicks "Send Reset Code"
4. System checks if User exists with that email
5. **User exists** -> Continue (if not, show generic message for security)
6. System generates 6-digit PIN: "639284"
7. System creates VerificationToken (type: PASSWORD_RESET)
8. System sends email:
   ```
   Subject: Reset your NxLoy password

   Your password reset code is: 639284

   This code expires in 15 minutes.
   Enter this code in the app to reset your password.

   If you didn't request this, ignore this message.
   Never share this code with anyone, including NxLoy staff.
   ```
9. System shows PIN entry screen:
   - "Enter the code sent to user@example.com"
   - 6-digit input
   - "Resend code" button
10. User receives email
11. User enters PIN: "639284"
12. System validates PIN
13. **PIN matches** ✅
14. System marks VerificationToken as used
15. System shows "Set New Password" screen:
    - New password input
    - Confirm password input
16. User enters new password: "NewSecurePass456!"
17. User confirms
18. System validates password strength
19. System updates User.passwordHash = bcrypt.hash(newPassword, 12)
20. System invalidates all existing Sessions (security: logout everywhere)
21. System creates new Session (log user in)
22. System shows success: "Password reset successfully"
23. System redirects to dashboard

**Result**: User's password is reset, logged in on current device.

### Flow 4: Resend PIN Code

**Scenario**: User didn't receive PIN or it expired.

**Steps**:
1. User on PIN entry screen
2. User clicks "Resend code"
3. System checks rate limit (max 3 per hour for this email)
4. **Rate limit OK** -> Continue
5. System invalidates previous PIN (set usedAt = now or delete record)
6. System generates new 6-digit PIN
7. System creates new VerificationToken
8. System sends new email/SMS with new PIN
9. System shows message: "New code sent to user@example.com"
10. System resets countdown timer: "14:59"
11. User receives new PIN
12. User enters new PIN
13. System validates and completes verification

**Result**: New PIN sent, user can verify.

### Flow 5: Failed PIN Attempt

**Scenario**: User enters wrong PIN.

**Steps**:
1. User enters PIN: "123456"
2. System validates:
   - VerificationToken exists ✅
   - Not expired ✅
   - Not already used ✅
   - Attempts < 5 ✅
   - Hash matches... ❌ **Doesn't match**
3. System increments VerificationToken.attempts (now = 1)
4. System shows error: "Incorrect code. 4 attempts remaining."
5. User tries again: "654321" (wrong again)
6. System increments attempts (now = 2)
7. System shows error: "Incorrect code. 3 attempts remaining."
8. After 5 failed attempts:
9. System invalidates VerificationToken
10. System shows error: "Too many incorrect attempts. Request a new code."
11. User must click "Resend code"

**Result**: PIN invalidated after max attempts, user must request new one.

### Flow 6: Expired PIN

**Scenario**: User takes too long to enter PIN.

**Steps**:
1. System sent PIN at 10:00 AM (expires at 10:15 AM)
2. User opens email at 10:16 AM (1 minute late)
3. User enters PIN: "482719"
4. System validates:
   - VerificationToken exists ✅
   - Expired (expiresAt < now) ❌ **Expired**
5. System shows error: "This code has expired. Request a new code."
6. User clicks "Resend code"
7. System sends new PIN
8. User verifies with new PIN

**Result**: Expired PIN rejected, user requests new one.

---

## Database Schema

### VerificationToken Model (Updated)

```prisma
model VerificationToken {
  id         String   @id @default(cuid())

  // What's being verified
  identifier String   // Email or phone number
  type       VerificationType

  // PIN storage
  pinHash    String   // Hashed PIN (bcrypt or SHA256+salt)
  salt       String?  // Salt for SHA256 (if using SHA256)

  // Security
  attempts   Int      @default(0)  // Failed attempts counter
  expiresAt  DateTime
  usedAt     DateTime? // Null if unused, timestamp if used

  // Metadata
  userId     String?  // Optional: link to User if applicable
  ipAddress  String?  // IP that requested PIN
  userAgent  String?

  // Timestamps
  createdAt  DateTime @default(now())

  @@unique([identifier, type, usedAt]) // Allow multiple active tokens of different types
  @@index([identifier])
  @@index([expiresAt])
  @@map("verification_tokens")
}

enum VerificationType {
  EMAIL_VERIFICATION
  PHONE_VERIFICATION
  PASSWORD_RESET
  ACCOUNT_LINKING
  TWO_FACTOR_AUTH
  TRANSACTION_CONFIRMATION
}
```

**Key Design Decisions**:

1. **pinHash instead of plaintext token**:
   - Security: Never store plaintext PINs
   - Use SHA256 + salt (fast) or bcrypt cost 8 (more secure)

2. **attempts counter**:
   - Track failed attempts per PIN
   - Max 3-5 attempts before invalidation
   - Reset on successful use

3. **usedAt timestamp**:
   - Null = unused
   - Timestamp = used (one-time use enforced)
   - Used PINs can't be reused

4. **type enum**:
   - One enum for all verification types
   - Easy to add new types
   - Filter by type in queries

5. **Unique constraint on (identifier, type, usedAt)**:
   - Allows multiple active tokens per identifier (different types)
   - Example: User can have active EMAIL_VERIFICATION and PASSWORD_RESET tokens simultaneously
   - usedAt in constraint allows historical records

---

## API Contracts

### POST /auth/verification/send

Request a new PIN code.

**Request**:
```json
{
  "identifier": "user@example.com",
  "type": "EMAIL_VERIFICATION",
  "channel": "email"
}
```

**Parameters**:
- `identifier` - Email or phone to send PIN to
- `type` - Verification type (EMAIL_VERIFICATION, PHONE_VERIFICATION, PASSWORD_RESET, etc.)
- `channel` - Delivery channel: "email" or "sms"

**Response** (200 OK):
```json
{
  "message": "Verification code sent to user@example.com",
  "expiresIn": 900,
  "identifier": "user@example.com",
  "maskedIdentifier": "u***r@example.com"
}
```

**Response** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded. Try again in 45 minutes.",
  "retryAfter": 2700
}
```

### POST /auth/verification/verify

Verify a PIN code.

**Request**:
```json
{
  "identifier": "user@example.com",
  "type": "EMAIL_VERIFICATION",
  "pin": "482719"
}
```

**Response** (200 OK):
```json
{
  "message": "Verification successful",
  "verified": true
}
```

**Response** (400 Bad Request) - Incorrect PIN:
```json
{
  "error": "Incorrect verification code",
  "attemptsRemaining": 3
}
```

**Response** (400 Bad Request) - Expired:
```json
{
  "error": "Verification code has expired. Request a new code.",
  "expired": true
}
```

**Response** (400 Bad Request) - Too Many Attempts:
```json
{
  "error": "Too many incorrect attempts. Request a new code.",
  "maxAttemptsReached": true
}
```

**Response** (400 Bad Request) - Already Used:
```json
{
  "error": "This code has already been used. Request a new code.",
  "alreadyUsed": true
}
```

### POST /auth/verification/resend

Resend verification code (invalidates previous code).

**Request**:
```json
{
  "identifier": "user@example.com",
  "type": "EMAIL_VERIFICATION"
}
```

**Response** (200 OK):
```json
{
  "message": "New verification code sent",
  "expiresIn": 900
}
```

---

## Implementation Guidelines

### Backend Implementation

**1. PIN Generation Service**:

```typescript
// Pseudo-code example
class PinService {
  generatePin(): string {
    // Generate 6 random digits
    const randomBytes = crypto.randomBytes(4);
    const randomInt = randomBytes.readUInt32BE(0);
    const pin = (randomInt % 1000000).toString().padStart(6, '0');
    return pin;
  }

  hashPin(pin: string): {hash: string, salt: string} {
    // Option A: bcrypt (more secure, slower)
    const hash = bcrypt.hashSync(pin, 8);
    return {hash, salt: null};

    // Option B: SHA256 + salt (faster, sufficient for short-lived PINs)
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', salt).update(pin).digest('hex');
    return {hash, salt};
  }

  verifyPin(pin: string, storedHash: string, salt?: string): boolean {
    // Option A: bcrypt
    return bcrypt.compareSync(pin, storedHash);

    // Option B: SHA256 + salt
    const hash = crypto.createHmac('sha256', salt).update(pin).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
  }
}
```

**2. Rate Limiting Service**:

```typescript
// Pseudo-code using Redis
class RateLimitService {
  async checkRateLimit(identifier: string, type: string): Promise<boolean> {
    const key = `pin:${type}:${identifier}`;
    const count = await redis.incr(key);

    if (count === 1) {
      // First request, set expiry
      await redis.expire(key, 3600); // 1 hour
    }

    return count <= 3; // Max 3 requests per hour
  }

  async checkAttempts(tokenId: string): Promise<boolean> {
    const token = await prisma.verificationToken.findUnique({
      where: {id: tokenId}
    });

    return token && token.attempts < 5;
  }
}
```

**3. Email/SMS Delivery (Hybrid Approach)**:

```typescript
// Pseudo-code for sending PIN + Link (both methods in one email)
class NotificationService {
  async sendPinEmail(email: string, pin: string, verificationLink: string, expiresInMinutes: number) {
    // Email contains BOTH PIN code (prominent) and verification link (secondary)
    await emailService.send({
      to: email,
      from: 'verify@nxloy.com',
      subject: 'Your NxLoy verification code',
      template: 'pin-verification-hybrid',
      data: {
        pin: pin,                           // Prominent display
        verificationLink: verificationLink, // Secondary option
        expiresIn: expiresInMinutes,
        security: 'Never share this code with anyone, including NxLoy staff.'
      }
    });
  }

  async sendPinSms(phone: string, pin: string, expiresInMinutes: number) {
    // SMS only contains PIN (no room for links)
    await smsService.send({
      to: phone,
      from: 'NXLOY',
      message: `Your NxLoy code is: ${pin}. Expires in ${expiresInMinutes} min. Never share this code.`
    });
  }
}
```

**Hybrid Strategy Notes**:
- Email contains both PIN (large, prominent) and link (small, secondary)
- PIN is the recommended method shown in UI
- Link is available for accessibility or user preference
- SMS only contains PIN (no room for links)
- Both PIN and link use the same VerificationToken record
- User can use either method to verify

### Frontend Implementation

**UI/UX Strategy: Promote PIN as Primary Method**

The user interface should make PIN code entry the obvious, primary method:

**Verification Screen Layout**:
```
┌─────────────────────────────────────┐
│  [Logo]                             │
│                                     │
│  Verify Your Email                  │
│  We sent a code to user@example.com │
│                                     │
│  ┌───┬───┬───┬───┬───┬───┐        │ ← Large, prominent
│  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │        │
│  └───┴───┴───┴───┴───┴───┘        │
│                                     │
│  Code expires in 14:32              │
│                                     │
│  [Resend Code]                      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Having trouble? Use email link     │ ← Small, secondary
│                                     │
└─────────────────────────────────────┘
```

**Key UI Principles**:
- PIN input boxes are large, centered, impossible to miss
- Email link option is small, gray, at bottom (fallback)
- No "Verify" button needed (auto-submit on 6th digit)
- Clear visual hierarchy guides users to PIN first

**1. PIN Input Component**:

```typescript
// Component features (pseudo-code)
<PinInput
  length={6}
  onComplete={(pin) => handleVerify(pin)}
  autoFocus={true}
  autoSubmit={true} // Submit when all 6 digits entered
/>

Features:
- 6 separate input boxes (one per digit)
- Auto-advance to next box on digit entry
- Auto-submit on 6th digit (UX: no "Verify" button needed)
- Paste support (paste "123456" fills all boxes)
- Backspace navigation (backspace on empty box goes to previous)
- Mobile keyboard: numeric (type="tel" or inputMode="numeric")
```

**2. Countdown Timer**:

```typescript
// Show expiry countdown
function ExpiryTimer({expiresAt}) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const left = calculateTimeLeft(expiresAt);
      setTimeLeft(left);

      if (left <= 0) {
        showExpiredMessage();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return <div>Code expires in {formatTime(timeLeft)}</div>;
}
```

**3. Error Handling**:

```typescript
// Handle verification errors gracefully
async function verifyPin(pin: string) {
  try {
    const response = await api.post('/auth/verification/verify', {
      identifier: email,
      type: 'EMAIL_VERIFICATION',
      pin: pin
    });

    if (response.verified) {
      showSuccess('Email verified!');
      navigateToDashboard();
    }
  } catch (error) {
    if (error.attemptsRemaining !== undefined) {
      showError(`Incorrect code. ${error.attemptsRemaining} attempts remaining.`);
    } else if (error.expired) {
      showError('Code expired. Request a new code.');
      showResendButton();
    } else if (error.maxAttemptsReached) {
      showError('Too many attempts. Request a new code.');
      disablePinInput();
      showResendButton();
    } else if (error.alreadyUsed) {
      showError('Code already used. Request a new code.');
      showResendButton();
    } else {
      showError('Verification failed. Please try again.');
    }
  }
}
```

---

## Edge Cases

### 1. User Requests Multiple PINs

**Scenario**: User clicks "Resend code" multiple times rapidly.

**Handling**:
- Rate limit: Max 3 resends per hour
- Invalidate previous PIN when new one is sent
- Show message: "New code sent. Previous code is no longer valid."
- Disable "Resend" button for 60 seconds after each send

### 2. User Enters Correct PIN from Old Request

**Scenario**: User requests 2 PINs, enters the first PIN (should fail).

**Handling**:
- When sending new PIN, mark old PIN as used (usedAt = now)
- Old PIN verification fails: "Code no longer valid. Use the latest code sent."
- User must use most recent PIN

### 3. Multiple Devices / Sessions

**Scenario**: User requests PIN on mobile app, then requests another on web app.

**Handling**:
- Each request invalidates previous PIN (same identifier + type)
- Only latest PIN is valid
- Show message on all devices: "A new code was requested. Previous code is no longer valid."

### 4. PIN Collision (Same PIN Generated Twice)

**Scenario**: Random generator produces same PIN for two users.

**Probability**: 1 in 1 million

**Handling**:
- Unique constraint on (identifier, pinHash)? No - different users can have same PIN
- Security: PINs are tied to identifier, so no issue
- User A's PIN "123456" only works for User A
- User B's PIN "123456" only works for User B

### 5. User Changes Email Before Verifying

**Scenario**: User signs up with email1@example.com, requests PIN, then changes to email2@example.com before verifying.

**Handling**:
- Don't allow email changes until current email is verified
- Or: Invalidate old PINs when email changes
- Require verification of new email

### 6. Daylight Saving Time / Timezone Issues

**Scenario**: Expiry time calculated incorrectly due to timezone.

**Handling**:
- Always use UTC for timestamps in database
- expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
- Convert to user's timezone only for display
- Server checks expiry in UTC

### 7. Copy-Paste from Email

**Scenario**: User copies PIN with extra spaces or formatting.

**Handling**:
- Strip whitespace before validation: pin.trim().replace(/\s/g, '')
- Accept: "123456", " 123456", "123 456", "123-456"
- Normalize to: "123456"

---

## Appendix

### Email Template Example (Hybrid: PIN + Link)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://app.nxloy.com/logo.png" alt="NxLoy" style="height: 40px;">
  </div>

  <h2 style="color: #333;">Verify Your Email</h2>

  <!-- PRIMARY METHOD: PIN CODE (Prominent) -->
  <p style="color: #666; font-size: 16px;">
    Your NxLoy verification code is:
  </p>

  <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">
      {{PIN}}
    </div>
  </div>

  <p style="color: #666; font-size: 14px;">
    This code expires in <strong>{{EXPIRES_IN}} minutes</strong>.
  </p>

  <p style="color: #666; font-size: 14px;">
    Enter this code in the NxLoy app to verify your email address.
  </p>

  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0;">
    <p style="color: #856404; font-size: 14px; margin: 0;">
      <strong>Security Note:</strong> Never share this code with anyone, including NxLoy staff. We will never ask for this code.
    </p>
  </div>

  <!-- SECONDARY METHOD: Link (Small, not prominent) -->
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #999; font-size: 12px;">
      Alternatively, you can click this link to verify:
    </p>
    <p style="font-size: 12px;">
      <a href="{{VERIFICATION_LINK}}" style="color: #007bff; text-decoration: none;">
        {{VERIFICATION_LINK}}
      </a>
    </p>
  </div>

  <p style="color: #999; font-size: 12px; margin-top: 30px;">
    If you didn't request this code, you can safely ignore this email.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © 2025 NxLoy. All rights reserved.
  </p>
</body>
</html>
```

**Template Design Notes**:
- PIN code is large (32px), bold, prominent, centered
- Link is small (12px), in footer section, gray color (de-emphasized)
- Both methods expire at the same time
- Both methods use the same VerificationToken record
- UI hierarchy makes PIN the obvious primary choice

### SMS Template Example

```
Your NxLoy code is: {{PIN}}

Expires in {{EXPIRES_IN}} min. Never share this code.

NxLoy
```

(160 characters - fits in single SMS)

---

**Document Status**: Draft - Ready for Review
**Next Steps**:
1. Review by security team (PIN length, rate limits)
2. Review by UX team (user flows, error messages)
3. Approve email/SMS templates
4. Implement backend PIN service
5. Implement frontend PIN input component
6. Add to authentication feature tasks

