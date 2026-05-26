import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';

@ApiTags('Leases')
@ApiBearerAuth()
@Controller('leases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeasesController {
  private readonly logger = new Logger(LeasesController.name);

  constructor(private leasesService: LeasesService) {}

  @ApiOperation({ summary: 'Create a lease' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: CreateLeaseDto,
  ) {
    this.logger.log(`Create lease request from ${user.email}`);
    return this.leasesService.create(dto, user);
  }

  @ApiOperation({ summary: 'List leases (paginated, filterable)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'propertyId', required: false })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findAll(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: PaginationQueryDto,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.leasesService.findAll(user, query, status, propertyId);
  }

  @ApiOperation({ summary: 'Get a lease by ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.leasesService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update a lease' })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: UpdateLeaseDto,
  ) {
    this.logger.log(`Update lease ${id} by ${user.email}`);
    return this.leasesService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete a lease (admin only)' })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    this.logger.log(`Delete lease ${id} by ${user.email}`);
    return this.leasesService.remove(id, user);
  }
}
