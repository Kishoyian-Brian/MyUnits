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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../generated/prisma/enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { PropertiesService } from './properties.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { propertyImagesMulterOptions } from './config/property-images.multer';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  private readonly logger = new Logger(PropertiesController.name);

  constructor(private propertiesService: PropertiesService) {}

  @ApiOperation({ summary: 'Create a property' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(
    @CurrentUser() user: JwtPayloadUser,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    this.logger.log(`Create property request from ${user.email}`);
    return this.propertiesService.create(createPropertyDto, user);
  }

  @ApiOperation({ summary: 'List all properties (paginated)' })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.USER)
  findAll(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: PaginationQueryDto,
  ) {
    this.logger.log(`List properties for ${user.email}`);
    return this.propertiesService.findAll(user, query);
  }

  @ApiOperation({ summary: 'Upload images for a property' })
  @ApiConsumes('multipart/form-data')
  @Post(':id/images')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @UseInterceptors(
    FilesInterceptor('images', 10, propertyImagesMulterOptions),
  )
  uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    this.logger.log(`Upload images for property ${id} by ${user.email}`);
    return this.propertiesService.uploadImages(id, files, user);
  }

  @ApiOperation({ summary: 'Delete a property image' })
  @Delete(':id/images/:imageId')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    this.logger.log(`Delete image ${imageId} from property ${id}`);
    return this.propertiesService.removeImage(id, imageId, user);
  }

  @ApiOperation({ summary: 'Get a property by ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.USER)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    this.logger.log(`Get property ${id} for ${user.email}`);
    return this.propertiesService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update a property' })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    this.logger.log(`Update property ${id} for ${user.email}`);
    return this.propertiesService.update(id, updatePropertyDto, user);
  }

  @ApiOperation({ summary: 'Delete a property' })
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    this.logger.log(`Delete property ${id} for ${user.email}`);
    return this.propertiesService.remove(id, user);
  }
}
