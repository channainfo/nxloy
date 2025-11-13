import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

/**
 * Create Role DTO
 * Creates new role with permissions
 */
export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[]; // Initial permissions to assign
}
