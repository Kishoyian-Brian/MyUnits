import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RentAdjustmentsService } from './rent-adjustments.service';
import { RentAdjustmentsController } from './rent-adjustments.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [RentAdjustmentsService],
  controllers: [RentAdjustmentsController],
  exports: [RentAdjustmentsService],
})
export class RentAdjustmentsModule {}
