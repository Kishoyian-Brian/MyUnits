import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import { PaymentMethod } from '../../generated/prisma/enums';

export class CreatePaymentDto {
  @IsUUID()
  invoiceId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ValidateIf((o) => o.method === 'MPESA')
  @IsString()
  @IsOptional()
  mpesaCode?: string;
}
