import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  leaseId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Type(() => Number)
  @IsInt()
  year: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rentAmount: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  utilityAmount: number;

  @Type(() => Date)
  @IsDate()
  dueDate: Date;
}
