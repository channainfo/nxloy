import { IsString, IsEnum, Length, Matches } from 'class-validator';
import { MfaMethod } from '../interfaces/mfa.interface';

/**
 * Verify MFA DTO
 * Used during login to verify MFA code
 */
export class VerifyMfaDto {
  @IsEnum(MfaMethod)
  method: MfaMethod;

  @IsString()
  @Length(6, 8) // 6 for TOTP/SMS/Email, 8 for backup codes
  @Matches(/^[A-Z0-9]+$/, { message: 'Invalid code format' })
  code: string;
}
