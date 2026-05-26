import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [UnitsService],
  controllers: [UnitsController],
  exports: [UnitsService],
})
export class UnitsModule {}
