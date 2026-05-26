import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationMeta, buildSkipTake } from '../common/helpers/paginate';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const tenant = await this.prisma.tenant.create({
      data: {
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        nationalId: dto.nationalId,
      },
    });

    return { message: 'Tenant created successfully', tenant };
  }

  async findAll(
    user: JwtPayloadUser,
    query: PaginationQueryDto,
    search?: string,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = buildSkipTake(page, limit);

    const where = this.buildListWhere(user, search);

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { data: tenants, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        leases: {
          include: {
            unit: {
              include: { property: { select: { id: true, name: true } } },
            },
          },
          orderBy: { startDate: 'desc' },
        },
        _count: { select: { leases: true, notifications: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return { tenant };
  }

  async update(id: string, dto: UpdateTenantDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existing = await this.prisma.tenant.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tenant not found');

    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.nationalId !== undefined && { nationalId: dto.nationalId }),
      },
    });

    return { message: 'Tenant updated successfully', tenant };
  }

  async remove(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        leases: { where: { status: 'ACTIVE' }, select: { id: true }, take: 1 },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    if (tenant.leases.length > 0) {
      throw new BadRequestException(
        'Cannot delete a tenant with active leases. Terminate leases first.',
      );
    }

    await this.prisma.tenant.delete({ where: { id } });
    return { message: 'Tenant deleted successfully' };
  }

  private buildListWhere(user: JwtPayloadUser, search?: string) {
    const where: Record<string, unknown> = {};

    if (user.role === UserRole.LANDLORD) {
      where.leases = {
        some: { unit: { property: { ownerId: user.userId } } },
      };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { nationalId: { contains: search } },
      ];
    }

    return where;
  }
}
