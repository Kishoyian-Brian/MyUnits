import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MaintenancePriority, MaintenanceStatus } from '../../generated/prisma/enums';

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsOptional()
  @IsString()
  notes?: string;
}
