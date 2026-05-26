import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { LeaseStatus } from '../../generated/prisma/enums';

export class UpdateLeaseDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsEnum(LeaseStatus)
  status?: LeaseStatus;
}
