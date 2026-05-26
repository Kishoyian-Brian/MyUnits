import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../generated/prisma/enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.LANDLORD)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get dashboard summary (counts & totals)' })
  @Get('summary')
  getSummary(@CurrentUser() user: JwtPayloadUser) {
    return this.dashboardService.getSummary(user);
  }

  @ApiOperation({ summary: 'Get revenue breakdown' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @Get('revenue')
  getRevenue(
    @CurrentUser() user: JwtPayloadUser,
    @Query('year') year: string,
    @Query('month') month?: string,
  ) {
    return this.dashboardService.getRevenue(
      user,
      Number(year) || new Date().getFullYear(),
      month ? Number(month) : undefined,
    );
  }

  @ApiOperation({ summary: 'Get occupancy rates' })
  @Get('occupancy')
  getOccupancy(@CurrentUser() user: JwtPayloadUser) {
    return this.dashboardService.getOccupancy(user);
  }
}
