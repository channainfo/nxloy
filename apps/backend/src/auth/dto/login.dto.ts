import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Login DTO
 * Validates email/password login credentials
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
