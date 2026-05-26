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
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitsController {
  private readonly logger = new Logger(UnitsController.name);

  constructor(private unitsService: UnitsService) {}

  @ApiOperation({ summary: 'Create a unit' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: CreateUnitDto,
  ) {
    this.logger.log(`Create unit request from ${user.email}`);
    return this.unitsService.create(dto, user);
  }

  @ApiOperation({ summary: 'List units (paginated, filterable)' })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.USER)
  findAll(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: PaginationQueryDto,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
  ) {
    this.logger.log(`List units for ${user.email}`);
    return this.unitsService.findAll(user, query, propertyId, status);
  }

  @ApiOperation({ summary: 'Get a unit by ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.USER)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.unitsService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update a unit' })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: UpdateUnitDto,
  ) {
    this.logger.log(`Update unit ${id} by ${user.email}`);
    return this.unitsService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete a unit' })
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    this.logger.log(`Delete unit ${id} by ${user.email}`);
    return this.unitsService.remove(id, user);
  }
}
