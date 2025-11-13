import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * Request PIN DTO
 * Used to request a new verification PIN
 */
export class RequestPinDto {
  @IsString()
  identifier: string; // Email or phone number

  @IsEnum([
    'EMAIL_VERIFICATION',
    'PHONE_VERIFICATION',
    'PASSWORD_RESET',
    'ACCOUNT_LINKING',
    'TWO_FACTOR_AUTH',
    'PHONE_NUMBER_CHANGE',
  ])
  type: string;

  @IsOptional()
  @IsString()
  userId?: string; // Optional: for existing users
}
