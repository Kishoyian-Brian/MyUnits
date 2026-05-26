import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../generated/prisma/enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateLandlordDto } from './dto/create-landlord.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @Get('me')
  getMe(@CurrentUser() user: JwtPayloadUser) {
    this.logger.log(`Get profile for ${user.email}`);
    return this.usersService.getProfile(user.userId);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @Patch('me')
  updateMe(
    @CurrentUser() user: JwtPayloadUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    this.logger.log(`Update profile for ${user.email}`);
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }

  @ApiOperation({ summary: 'Create a landlord account (admin only)' })
  @Post('landlords')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  createLandlord(@Body() createLandlordDto: CreateLandlordDto) {
    this.logger.log(`Admin creating landlord ${createLandlordDto.email}`);
    return this.usersService.createLandlord(createLandlordDto);
  }

  @ApiOperation({ summary: 'List all users (admin only)' })
  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  findAll() {
    this.logger.log('Admin list all users');
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  findById(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Admin get user ${id}`);
    return this.usersService.findById(id);
  }
}
