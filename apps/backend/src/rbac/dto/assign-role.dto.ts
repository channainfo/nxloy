import { IsString, IsOptional } from 'class-validator';

/**
 * Assign Role DTO
 * Assigns role to user with optional scope
 */
export class AssignRoleDto {
  @IsString()
  roleId: string;

  @IsOptional()
  @IsString()
  scopeType?: string; // business, partner, global

  @IsOptional()
  @IsString()
  scopeId?: string; // ID of business/partner
}
