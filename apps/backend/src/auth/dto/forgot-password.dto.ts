import { IsEmail } from 'class-validator';

/**
 * Forgot Password DTO
 * Used to request password reset
 */
export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
