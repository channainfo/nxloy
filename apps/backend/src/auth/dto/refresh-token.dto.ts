import { IsString } from 'class-validator';

/**
 * Refresh Token DTO
 * Used to obtain new access token using refresh token
 */
export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
