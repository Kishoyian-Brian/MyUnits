import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { MaintenancePriority } from '../../generated/prisma/enums';

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsUUID()
  unitId: string;

  @IsUUID()
  tenantId: string;
}
