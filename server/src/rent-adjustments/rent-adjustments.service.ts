import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationMeta, buildSkipTake } from '../common/helpers/paginate';
import { CreateRentAdjustmentDto } from './dto/create-rent-adjustment.dto';

@Injectable()
export class RentAdjustmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRentAdjustmentDto, user: JwtPayloadUser) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: dto.unitId },
      include: { property: { select: { ownerId: true } } },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    this.assertCanManage(unit.property.ownerId, user);

    const [adjustment] = await this.prisma.$transaction([
      this.prisma.rentAdjustment.create({
        data: {
          unitId: dto.unitId,
          previousAmount: unit.rentAmount,
          newAmount: dto.newAmount,
          effectiveDate: dto.effectiveDate,
          reason: dto.reason,
        },
        include: {
          unit: {
            select: { id: true, unitNumber: true, property: { select: { id: true, name: true } } },
          },
        },
      }),
      this.prisma.unit.update({
        where: { id: dto.unitId },
        data: { rentAmount: dto.newAmount },
      }),
    ]);

    return { message: 'Rent adjusted successfully', adjustment };
  }

  async findAll(
    user: JwtPayloadUser,
    query: PaginationQueryDto,
    unitId?: string,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = buildSkipTake(page, limit);

    const where: Record<string, unknown> = {};
    if (unitId) where.unitId = unitId;

    if (user.role === UserRole.LANDLORD) {
      where.unit = { property: { ownerId: user.userId } };
    }

    const [adjustments, total] = await Promise.all([
      this.prisma.rentAdjustment.findMany({
        where,
        include: {
          unit: {
            select: { id: true, unitNumber: true, property: { select: { id: true, name: true } } },
          },
        },
        orderBy: { effectiveDate: 'desc' },
        skip,
        take,
      }),
      this.prisma.rentAdjustment.count({ where }),
    ]);

    return { data: adjustments, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string, user: JwtPayloadUser) {
    const adjustment = await this.prisma.rentAdjustment.findUnique({
      where: { id },
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            rentAmount: true,
            property: { select: { id: true, name: true, ownerId: true } },
          },
        },
      },
    });
    if (!adjustment) throw new NotFoundException('Rent adjustment not found');
    this.assertCanView(adjustment.unit.property.ownerId, user);
    return { adjustment };
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
