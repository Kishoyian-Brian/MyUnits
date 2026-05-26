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
import { RentAdjustmentsService } from './rent-adjustments.service';
import { CreateRentAdjustmentDto } from './dto/create-rent-adjustment.dto';

@ApiTags('Rent Adjustments')
@ApiBearerAuth()
@Controller('rent-adjustments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RentAdjustmentsController {
  constructor(private rentAdjustmentsService: RentAdjustmentsService) {}

  @ApiOperation({ summary: 'Create a rent adjustment' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: CreateRentAdjustmentDto,
  ) {
    return this.rentAdjustmentsService.create(dto, user);
  }

  @ApiOperation({ summary: 'List rent adjustments (paginated)' })
  @ApiQuery({ name: 'unitId', required: false })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findAll(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: PaginationQueryDto,
    @Query('unitId') unitId?: string,
  ) {
    return this.rentAdjustmentsService.findAll(user, query, unitId);
  }

  @ApiOperation({ summary: 'Get a rent adjustment by ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.rentAdjustmentsService.findOne(id, user);
  }
}
