import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ExpenseCategory } from '../../generated/prisma/enums';

export class CreateExpenseDto {
  @IsUUID()
  propertyId: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
