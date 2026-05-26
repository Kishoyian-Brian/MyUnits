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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../generated/prisma/enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { maintenanceImagesMulterOptions } from './config/maintenance-images.multer';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  private readonly logger = new Logger(MaintenanceController.name);

  constructor(private maintenanceService: MaintenanceService) {}

  @ApiOperation({ summary: 'Create a maintenance request' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: CreateMaintenanceDto,
  ) {
    this.logger.log(`Create maintenance request by ${user.email}`);
    return this.maintenanceService.create(dto, user);
  }

  @ApiOperation({ summary: 'List maintenance requests (paginated, filterable)' })
  @ApiQuery({ name: 'unitId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findAll(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: PaginationQueryDto,
    @Query('unitId') unitId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.maintenanceService.findAll(user, query, unitId, status, priority);
  }

  @ApiOperation({ summary: 'Get a maintenance request by ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.maintenanceService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update a maintenance request' })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: UpdateMaintenanceDto,
  ) {
    return this.maintenanceService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete a maintenance request (admin only)' })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.maintenanceService.remove(id, user);
  }

  @ApiOperation({ summary: 'Upload images for a maintenance request' })
  @ApiConsumes('multipart/form-data')
  @Post(':id/images')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @UseInterceptors(FilesInterceptor('images', 5, maintenanceImagesMulterOptions))
  uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.maintenanceService.uploadImages(id, files, user);
  }

  @ApiOperation({ summary: 'Delete a maintenance request image' })
  @Delete(':id/images/:imageId')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.maintenanceService.removeImage(id, imageId, user);
  }
}
