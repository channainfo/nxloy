import { IsEmail, IsString, MinLength, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Reset Password DTO
 * Used to reset password with PIN verification
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '6-digit PIN sent to email',
    example: '123456',
    pattern: '^\\d{6}$',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'PIN must be exactly 6 digits' })
  pin: string;

  @ApiProperty({
    description: 'New password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    example: 'NewSecureP@ss123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  newPassword: string;
}
