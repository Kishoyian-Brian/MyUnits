import {
  Body,
  Controller,
  Delete,
  Get,
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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @ApiOperation({ summary: 'Create an expense' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(dto, user);
  }

  @ApiOperation({ summary: 'List expenses (paginated, filterable by date range)' })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'from', required: false, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date (ISO 8601)' })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findAll(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: PaginationQueryDto,
    @Query('propertyId') propertyId?: string,
    @Query('category') category?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.expensesService.findAll(user, query, propertyId, category, from, to);
  }

  @ApiOperation({ summary: 'Get an expense by ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.expensesService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update an expense' })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete an expense' })
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.expensesService.remove(id, user);
  }
}
