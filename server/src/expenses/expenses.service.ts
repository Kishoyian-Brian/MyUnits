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
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExpenseDto, user: JwtPayloadUser) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');
    this.assertCanManage(property.ownerId, user);

    const expense = await this.prisma.expense.create({
      data: {
        propertyId: dto.propertyId,
        category: dto.category,
        amount: dto.amount,
        description: dto.description,
        date: dto.date,
        receiptUrl: dto.receiptUrl,
      },
      include: { property: { select: { id: true, name: true } } },
    });

    return { message: 'Expense recorded successfully', expense };
  }

  async findAll(
    user: JwtPayloadUser,
    query: PaginationQueryDto,
    propertyId?: string,
    category?: string,
    from?: string,
    to?: string,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = buildSkipTake(page, limit);

    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;
    if (category) where.category = category;

    if (from || to) {
      where.date = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    if (user.role === UserRole.LANDLORD) {
      where.property = { ownerId: user.userId };
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: { property: { select: { id: true, name: true } } },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return { data: expenses, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string, user: JwtPayloadUser) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { property: { select: { id: true, name: true, ownerId: true } } },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    this.assertCanView(expense.property.ownerId, user);
    return { expense };
  }

  async update(id: string, dto: UpdateExpenseDto, user: JwtPayloadUser) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existing = await this.prisma.expense.findUnique({
      where: { id },
      include: { property: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException('Expense not found');
    this.assertCanManage(existing.property.ownerId, user);

    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.date !== undefined && { date: dto.date }),
        ...(dto.receiptUrl !== undefined && { receiptUrl: dto.receiptUrl }),
      },
      include: { property: { select: { id: true, name: true } } },
    });

    return { message: 'Expense updated successfully', expense };
  }

  async remove(id: string, user: JwtPayloadUser) {
    const existing = await this.prisma.expense.findUnique({
      where: { id },
      include: { property: { select: { ownerId: true } } },
    });
    if (!existing) throw new NotFoundException('Expense not found');
    this.assertCanManage(existing.property.ownerId, user);

    await this.prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted successfully' };
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
