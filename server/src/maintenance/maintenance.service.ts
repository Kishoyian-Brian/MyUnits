import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareR2Service } from '../storage/cloudflare-r2.service';
import type { JwtPayloadUser } from '../auth/types/jwt-payload';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationMeta, buildSkipTake } from '../common/helpers/paginate';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

const maintenanceInclude = {
  unit: {
    select: {
      id: true,
      unitNumber: true,
      property: { select: { id: true, name: true, ownerId: true } },
    },
  },
  tenant: { select: { id: true, fullName: true, phoneNumber: true } },
  images: { orderBy: { createdAt: 'asc' as const } },
} as const;

@Injectable()
export class MaintenanceService {
  constructor(
    private prisma: PrismaService,
    private r2: CloudflareR2Service,
  ) {}

  async create(dto: CreateMaintenanceDto, user: JwtPayloadUser) {
    const unit = await this.prisma.unit.findUnique({
      where: { id: dto.unitId },
      include: { property: { select: { ownerId: true } } },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    this.assertCanManage(unit.property.ownerId, user);

    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const request = await this.prisma.maintenanceRequest.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        unitId: dto.unitId,
        tenantId: dto.tenantId,
      },
      include: maintenanceInclude,
    });

    return { message: 'Maintenance request created successfully', request };
  }

  async findAll(
    user: JwtPayloadUser,
    query: PaginationQueryDto,
    unitId?: string,
    status?: string,
    priority?: string,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { skip, take } = buildSkipTake(page, limit);

    const where: Record<string, unknown> = {};
    if (unitId) where.unitId = unitId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    if (user.role === UserRole.LANDLORD) {
      where.unit = { property: { ownerId: user.userId } };
    }

    const [requests, total] = await Promise.all([
      this.prisma.maintenanceRequest.findMany({
        where,
        include: maintenanceInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.maintenanceRequest.count({ where }),
    ]);

    return { data: requests, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string, user: JwtPayloadUser) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: maintenanceInclude,
    });
    if (!request) throw new NotFoundException('Maintenance request not found');
    this.assertCanView(request.unit.property.ownerId, user);
    return { request };
  }

  async update(id: string, dto: UpdateMaintenanceDto, user: JwtPayloadUser) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existing = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { unit: { include: { property: { select: { ownerId: true } } } } },
    });
    if (!existing) throw new NotFoundException('Maintenance request not found');
    this.assertCanManage(existing.unit.property.ownerId, user);

    const request = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status === 'RESOLVED' && !existing.resolvedAt && { resolvedAt: new Date() }),
      },
      include: maintenanceInclude,
    });

    return { message: 'Maintenance request updated successfully', request };
  }

  async remove(id: string, user: JwtPayloadUser) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete maintenance requests');
    }

    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!request) throw new NotFoundException('Maintenance request not found');

    await this.deleteImageFiles(request.images);
    await this.prisma.maintenanceRequest.delete({ where: { id } });
    return { message: 'Maintenance request deleted successfully' };
  }

  async uploadImages(
    requestId: string,
    files: Express.Multer.File[],
    user: JwtPayloadUser,
  ) {
    if (!files?.length) {
      throw new BadRequestException('At least one image file is required');
    }

    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
      include: {
        unit: { include: { property: { select: { ownerId: true } } } },
        _count: { select: { images: true } },
      },
    });
    if (!request) throw new NotFoundException('Maintenance request not found');
    this.assertCanManage(request.unit.property.ownerId, user);

    if (request._count.images + files.length > 5) {
      throw new BadRequestException('A maintenance request can have at most 5 images');
    }

    const uploadedKeys: string[] = [];

    try {
      const images: Array<{ id: string; url: string; createdAt: Date }> = [];

      for (const file of files) {
        const filename = this.r2.buildUniqueFilename(file.originalname);
        const key = `maintenance/${requestId}/${filename}`;
        const url = await this.r2.uploadObject(key, file.buffer, file.mimetype);
        uploadedKeys.push(key);

        const image = await this.prisma.maintenanceImage.create({
          data: { maintenanceRequestId: requestId, url },
        });
        images.push(image);
      }

      return { message: `${images.length} image(s) uploaded successfully`, images };
    } catch (error) {
      await Promise.all(uploadedKeys.map((k) => this.r2.deleteObject(k).catch(() => undefined)));
      throw new InternalServerErrorException('Failed to upload images', { cause: error });
    }
  }

  async removeImage(requestId: string, imageId: string, user: JwtPayloadUser) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
      include: { unit: { include: { property: { select: { ownerId: true } } } } },
    });
    if (!request) throw new NotFoundException('Maintenance request not found');
    this.assertCanManage(request.unit.property.ownerId, user);

    const image = await this.prisma.maintenanceImage.findFirst({
      where: { id: imageId, maintenanceRequestId: requestId },
    });
    if (!image) throw new NotFoundException('Image not found');

    await this.prisma.maintenanceImage.delete({ where: { id: imageId } });
    const key = this.r2.getObjectKeyFromUrl(image.url);
    if (key) await this.r2.deleteObject(key).catch(() => undefined);

    return { message: 'Image deleted successfully' };
  }

  private async deleteImageFiles(images: Array<{ url: string }>) {
    for (const image of images) {
      const key = this.r2.getObjectKeyFromUrl(image.url);
      if (key) await this.r2.deleteObject(key).catch(() => undefined);
    }
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
