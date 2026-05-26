import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LeasesService } from './leases.service';
import { LeasesController } from './leases.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [LeasesService],
  controllers: [LeasesController],
  exports: [LeasesService],
})
export class LeasesModule {}
