import { IsString, Length, Matches } from 'class-validator';

/**
 * Verify PIN DTO
 * Used to verify a PIN code
 */
export class VerifyPinDto {
  @IsString()
  identifier: string; // Email or phone number

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'PIN must be exactly 6 digits' })
  pin: string;
}
