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
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUnitDto, user: JwtPayloadUser) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');
    this.assertCanManage(property.ownerId, user);

    const unit = await this.prisma.unit.create({
      data: {
        unitNumber: dto.unitNumber,
        rentAmount: dto.rentAmount,
        waterBill: dto.waterBill,
        electricityBill: dto.electricityBill,
        propertyId: dto.propertyId,
      },
      include: { property: { select: { id: true, name: true } } },
    });

    return { message: 'Unit created successfully', unit };
  }

  async findAll(
    user: JwtPayloadUser,
    query: PaginationQueryDto,
    propertyId?: string,
    status?: string,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = buildSkipTake(page, limit);

    const where: Record<string, unknown> = {};

    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;

    if (user.role === UserRole.USER) {
      where.status = 'VACANT';
    } else if (user.role === UserRole.LANDLORD) {
      where.property = { ownerId: user.userId };
    }

    const [units, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        include: { property: { select: { id: true, name: true, location: true } } },
        orderBy: { unitNumber: 'asc' },
        skip,
        take,
      }),
      this.prisma.unit.count({ where }),
    ]);

    return { data: units, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string, user: JwtPayloadUser) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, name: true, location: true, ownerId: true } },
        _count: { select: { leases: true } },
      },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    this.assertCanView(unit.property.ownerId, user);
    return { unit };
  }

  async update(id: string, dto: UpdateUnitDto, user: JwtPayloadUser) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: { property: { select: { ownerId: true } } },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    this.assertCanManage(unit.property.ownerId, user);

    const updated = await this.prisma.unit.update({
      where: { id },
      data: {
        ...(dto.unitNumber !== undefined && { unitNumber: dto.unitNumber }),
        ...(dto.rentAmount !== undefined && { rentAmount: dto.rentAmount }),
        ...(dto.waterBill !== undefined && { waterBill: dto.waterBill }),
        ...(dto.electricityBill !== undefined && { electricityBill: dto.electricityBill }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: { property: { select: { id: true, name: true } } },
    });

    return { message: 'Unit updated successfully', unit: updated };
  }

  async remove(id: string, user: JwtPayloadUser) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        property: { select: { ownerId: true } },
        leases: { where: { status: 'ACTIVE' }, select: { id: true }, take: 1 },
      },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    this.assertCanManage(unit.property.ownerId, user);

    if (unit.leases.length > 0) {
      throw new BadRequestException(
        'Cannot delete a unit with active leases. Terminate leases first.',
      );
    }

    await this.prisma.unit.delete({ where: { id } });
    return { message: 'Unit deleted successfully' };
  }

  private assertCanManage(ownerId: string, user: JwtPayloadUser): void {
    if (user.role === UserRole.ADMIN) return;
    if (user.role === UserRole.LANDLORD && ownerId === user.userId) return;
    throw new ForbiddenException('You do not have access to this resource');
  }

  private assertCanView(ownerId: string, user: JwtPayloadUser): void {
    if (user.role === UserRole.USER || user.role === UserRole.ADMIN) return;
    if (user.role === UserRole.LANDLORD && ownerId === user.userId) return;
    throw new ForbiddenException('You do not have access to this resource');
  }
}
