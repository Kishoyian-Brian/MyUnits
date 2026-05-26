import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationMeta, buildSkipTake } from '../common/helpers/paginate';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    if (dto.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
      if (!tenant) throw new NotFoundException('Tenant not found');
    }

    const notification = await this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        sentVia: dto.sentVia,
        tenantId: dto.tenantId,
      },
      include: { tenant: { select: { id: true, fullName: true } } },
    });

    return { message: 'Notification created successfully', notification };
  }

  async findAll(
    user: JwtPayloadUser,
    query: PaginationQueryDto,
    tenantId?: string,
    sentVia?: string,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = buildSkipTake(page, limit);

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (sentVia) where.sentVia = sentVia;

    if (user.role === UserRole.LANDLORD) {
      where.tenant = {
        leases: { some: { unit: { property: { ownerId: user.userId } } } },
      };
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: { tenant: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data: notifications, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: { tenant: { select: { id: true, fullName: true, phoneNumber: true, email: true } } },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return { notification };
  }
}
