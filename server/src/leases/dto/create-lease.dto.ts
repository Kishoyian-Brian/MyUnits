import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateLeaseDto {
  @IsUUID()
  tenantId: string;

  @IsUUID()
  unitId: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  depositAmount: number;
}
