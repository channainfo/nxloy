import { IsString, Length, Matches } from 'class-validator';

/**
 * Enable TOTP DTO
 * Verifies TOTP code to enable 2FA
 */
export class EnableTotpDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'Code must be exactly 6 digits' })
  code: string;
}
