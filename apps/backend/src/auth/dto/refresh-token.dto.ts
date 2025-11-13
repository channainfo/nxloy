import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Refresh Token DTO
 * Used to obtain new access token using refresh token
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token obtained from login or signup',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken: string;
}
