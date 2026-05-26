import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { UnitStatus } from '../../generated/prisma/enums';

export class UpdateUnitDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unitNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rentAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  waterBill?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  electricityBill?: number;

  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;
}
