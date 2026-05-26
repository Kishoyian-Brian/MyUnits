import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../generated/prisma/enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Send a notification' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @ApiOperation({ summary: 'List notifications (paginated, filterable)' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'sentVia', required: false })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findAll(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: PaginationQueryDto,
    @Query('tenantId') tenantId?: string,
    @Query('sentVia') sentVia?: string,
  ) {
    return this.notificationsService.findAll(user, query, tenantId, sentVia);
  }

  @ApiOperation({ summary: 'Get a notification by ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.findOne(id);
  }
}
