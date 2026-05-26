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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  private readonly logger = new Logger(InvoicesController.name);

  constructor(private invoicesService: InvoicesService) {}

  @ApiOperation({ summary: 'Create an invoice' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  create(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: CreateInvoiceDto,
  ) {
    this.logger.log(`Create invoice by ${user.email}`);
    return this.invoicesService.create(dto, user);
  }

  @ApiOperation({ summary: 'List invoices (paginated, filterable)' })
  @ApiQuery({ name: 'leaseId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findAll(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: PaginationQueryDto,
    @Query('leaseId') leaseId?: string,
    @Query('status') status?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.invoicesService.findAll(
      user,
      query,
      leaseId,
      status,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @ApiOperation({ summary: 'Get an invoice by ID' })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.invoicesService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Update an invoice' })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete an invoice (admin only)' })
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.invoicesService.remove(id, user);
  }
}
