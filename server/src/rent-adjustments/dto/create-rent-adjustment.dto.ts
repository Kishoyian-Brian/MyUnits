import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRentAdjustmentDto {
  @IsUUID()
  unitId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  newAmount: number;

  @Type(() => Date)
  @IsDate()
  effectiveDate: Date;

  @IsOptional()
  @IsString()
  reason?: string;
}
