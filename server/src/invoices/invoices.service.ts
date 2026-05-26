import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationMeta, buildSkipTake } from '../common/helpers/paginate';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

const invoiceInclude = {
  lease: {
    select: {
      id: true,
      tenant: { select: { id: true, fullName: true } },
      unit: {
        select: {
          id: true,
          unitNumber: true,
          property: { select: { id: true, name: true, ownerId: true } },
        },
      },
    },
  },
  payments: { orderBy: { paidAt: 'desc' as const } },
  _count: { select: { payments: true } },
} as const;

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto, user: JwtPayloadUser) {
    const lease = await this.prisma.lease.findUnique({
      where: { id: dto.leaseId },
      include: { unit: { include: { property: { select: { ownerId: true } } } } },
    });
    if (!lease) throw new NotFoundException('Lease not found');
    this.assertCanManage(lease.unit.property.ownerId, user);

    const totalAmount = dto.rentAmount + dto.utilityAmount;

    try {
      const invoice = await this.prisma.invoice.create({
        data: {
          leaseId: dto.leaseId,
          month: dto.month,
          year: dto.year,
          rentAmount: dto.rentAmount,
          utilityAmount: dto.utilityAmount,
          totalAmount,
          dueDate: dto.dueDate,
        },
        include: invoiceInclude,
      });

      return { message: 'Invoice created successfully', invoice };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException(
          `An invoice already exists for this lease in ${dto.month}/${dto.year}`,
        );
      }
      throw error;
    }
  }

  async findAll(
    user: JwtPayloadUser,
    query: PaginationQueryDto,
    leaseId?: string,
    status?: string,
    month?: number,
    year?: number,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = buildSkipTake(page, limit);

    const where: Record<string, unknown> = {};
    if (leaseId) where.leaseId = leaseId;
    if (status) where.status = status;
    if (month) where.month = month;
    if (year) where.year = year;

    if (user.role === UserRole.LANDLORD) {
      where.lease = { unit: { property: { ownerId: user.userId } } };
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: invoiceInclude,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip,
        take,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data: invoices, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string, user: JwtPayloadUser) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: invoiceInclude,
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    this.assertCanView(invoice.lease.unit.property.ownerId, user);
    return { invoice };
  }

  async update(id: string, dto: UpdateInvoiceDto, user: JwtPayloadUser) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existing = await this.prisma.invoice.findUnique({
      where: { id },
      include: { lease: { include: { unit: { include: { property: { select: { ownerId: true } } } } } } },
    });
    if (!existing) throw new NotFoundException('Invoice not found');
    this.assertCanManage(existing.lease.unit.property.ownerId, user);

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
        ...(dto.status === 'PAID' && { paidAt: new Date() }),
      },
      include: invoiceInclude,
    });

    return { message: 'Invoice updated successfully', invoice };
  }

  async remove(id: string, user: JwtPayloadUser) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete invoices');
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { _count: { select: { payments: true } } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    if (invoice._count.payments > 0) {
      throw new BadRequestException(
        'Cannot delete an invoice that has payments. Remove payments first.',
      );
    }

    await this.prisma.invoice.delete({ where: { id } });
    return { message: 'Invoice deleted successfully' };
  }

  private assertCanManage(ownerId: string, user: JwtPayloadUser): void {
    if (user.role === UserRole.ADMIN) return;
    if (user.role === UserRole.LANDLORD && ownerId === user.userId) return;
    throw new ForbiddenException('You do not have access to this resource');
  }

  private assertCanView(ownerId: string, user: JwtPayloadUser): void {
    if (user.role === UserRole.ADMIN) return;
    if (user.role === UserRole.LANDLORD && ownerId === user.userId) return;
    throw new ForbiddenException('You do not have access to this resource');
  }
}
