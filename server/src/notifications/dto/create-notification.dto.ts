import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationChannel } from '../../generated/prisma/enums';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationChannel)
  sentVia: NotificationChannel;

  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
