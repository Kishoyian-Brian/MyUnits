import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationMeta, buildSkipTake } from '../common/helpers/paginate';
import { CreatePaymentDto } from './dto/create-payment.dto';

const paymentInclude = {
  invoice: {
    select: {
      id: true,
      month: true,
      year: true,
      totalAmount: true,
      status: true,
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
    },
  },
} as const;

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, user: JwtPayloadUser) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
      include: {
        lease: { include: { unit: { include: { property: { select: { ownerId: true } } } } } },
        payments: { select: { amount: true } },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    this.assertCanManage(invoice.lease.unit.property.ownerId, user);

    if (dto.method === 'MPESA' && !dto.mpesaCode) {
      throw new BadRequestException('M-Pesa code is required for MPESA payments');
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        method: dto.method,
        mpesaCode: dto.mpesaCode,
      },
      include: paymentInclude,
    });

    const totalPaid =
      invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + dto.amount;

    if (totalPaid >= Number(invoice.totalAmount) && invoice.status !== 'PAID') {
      await this.prisma.invoice.update({
        where: { id: dto.invoiceId },
        data: { status: 'PAID', paidAt: new Date() },
      });
    }

    return { message: 'Payment recorded successfully', payment };
  }

  async findAll(
    user: JwtPayloadUser,
    query: PaginationQueryDto,
    invoiceId?: string,
    method?: string,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = buildSkipTake(page, limit);

    const where: Record<string, unknown> = {};
    if (invoiceId) where.invoiceId = invoiceId;
    if (method) where.method = method;

    if (user.role === UserRole.LANDLORD) {
      where.invoice = { lease: { unit: { property: { ownerId: user.userId } } } };
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: paymentInclude,
        orderBy: { paidAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data: payments, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string, user: JwtPayloadUser) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: paymentInclude,
    });
    if (!payment) throw new NotFoundException('Payment not found');
    this.assertCanView(payment.invoice.lease.unit.property.ownerId, user);
    return { payment };
  }

  async remove(id: string, user: JwtPayloadUser) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can void payments');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: { include: { payments: { select: { id: true, amount: true } } } },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    await this.prisma.payment.delete({ where: { id } });

    const remainingTotal = payment.invoice.payments
      .filter((p) => p.id !== id)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    if (
      remainingTotal < Number(payment.invoice.totalAmount) &&
      payment.invoice.status === 'PAID'
    ) {
      await this.prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'PENDING', paidAt: null },
      });
    }

    return { message: 'Payment voided successfully' };
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
