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
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  private readonly logger = new Logger(TenantsController.name);

  constructor(private tenantsService: TenantsService) {}

  @ApiOperation({ summary: 'Create a tenant' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @ApiOperation({ summary: 'List tenants (paginated, searchable)' })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findAll(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: PaginationQueryDto,
    @Query('search') search?: string,
  ) {
    this.logger.log(`List tenants for ${user.email}`);
    return this.tenantsService.findAll(user, query, search);
  }

  @ApiOperation({ summary: 'Get a tenant by ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a tenant' })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a tenant' })
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.remove(id);
  }
}
