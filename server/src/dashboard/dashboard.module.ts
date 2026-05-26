import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
