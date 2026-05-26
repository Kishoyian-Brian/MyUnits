import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateUnitDto {
  @IsString()
  @IsNotEmpty()
  unitNumber: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rentAmount: number;

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

  @IsUUID()
  propertyId: string;
}
