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
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';

const leaseInclude = {
  tenant: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
  unit: {
    select: {
      id: true,
      unitNumber: true,
      rentAmount: true,
      status: true,
      property: { select: { id: true, name: true, ownerId: true } },
    },
  },
  _count: { select: { invoices: true } },
} as const;

@Injectable()
export class LeasesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeaseDto, user: JwtPayloadUser) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: dto.unitId },
      include: { property: { select: { ownerId: true } } },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    this.assertCanManage(unit.property.ownerId, user);

    if (unit.status !== 'VACANT') {
      throw new BadRequestException('Unit is not available — current status: ' + unit.status);
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const [lease] = await this.prisma.$transaction([
      this.prisma.lease.create({
        data: {
          tenantId: dto.tenantId,
          unitId: dto.unitId,
          startDate: dto.startDate,
          endDate: dto.endDate,
          depositAmount: dto.depositAmount,
        },
        include: leaseInclude,
      }),
      this.prisma.unit.update({
        where: { id: dto.unitId },
        data: { status: 'OCCUPIED' },
      }),
    ]);

    return { message: 'Lease created successfully', lease };
  }

  async findAll(
    user: JwtPayloadUser,
    query: PaginationQueryDto,
    status?: string,
    propertyId?: string,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = buildSkipTake(page, limit);

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (propertyId) where.unit = { propertyId };

    if (user.role === UserRole.LANDLORD) {
      where.unit = {
        ...(where.unit as object),
        property: { ownerId: user.userId },
      };
    }

    const [leases, total] = await Promise.all([
      this.prisma.lease.findMany({
        where,
        include: leaseInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.lease.count({ where }),
    ]);

    return { data: leases, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string, user: JwtPayloadUser) {
    const lease = await this.prisma.lease.findUnique({
      where: { id },
      include: leaseInclude,
    });
    if (!lease) throw new NotFoundException('Lease not found');
    this.assertCanView(lease.unit.property.ownerId, user);
    return { lease };
  }

  async update(id: string, dto: UpdateLeaseDto, user: JwtPayloadUser) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existing = await this.prisma.lease.findUnique({
      where: { id },
      include: { unit: { include: { property: { select: { ownerId: true } } } } },
    });
    if (!existing) throw new NotFoundException('Lease not found');
    this.assertCanManage(existing.unit.property.ownerId, user);

    const isTerminating =
      dto.status && (dto.status === 'ENDED' || dto.status === 'TERMINATED');
    const wasActive = existing.status === 'ACTIVE';

    if (isTerminating && wasActive) {
      const [lease] = await this.prisma.$transaction([
        this.prisma.lease.update({
          where: { id },
          data: {
            ...(dto.endDate !== undefined && { endDate: dto.endDate }),
            status: dto.status,
            terminatedAt: new Date(),
          },
          include: leaseInclude,
        }),
        this.prisma.unit.update({
          where: { id: existing.unitId },
          data: { status: 'VACANT' },
        }),
      ]);

      return { message: 'Lease terminated successfully', lease };
    }

    const lease = await this.prisma.lease.update({
      where: { id },
      data: {
        ...(dto.endDate !== undefined && { endDate: dto.endDate }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: leaseInclude,
    });

    return { message: 'Lease updated successfully', lease };
  }

  async remove(id: string, user: JwtPayloadUser) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete leases');
    }

    const lease = await this.prisma.lease.findUnique({
      where: { id },
      include: { unit: true },
    });
    if (!lease) throw new NotFoundException('Lease not found');

    if (lease.status === 'ACTIVE') {
      await this.prisma.$transaction([
        this.prisma.lease.delete({ where: { id } }),
        this.prisma.unit.update({
          where: { id: lease.unitId },
          data: { status: 'VACANT' },
        }),
      ]);
    } else {
      await this.prisma.lease.delete({ where: { id } });
    }

    return { message: 'Lease deleted successfully' };
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
