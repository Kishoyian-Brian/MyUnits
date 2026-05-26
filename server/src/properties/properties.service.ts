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
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

const unitSelect = {
  id: true,
  unitNumber: true,
  rentAmount: true,
  waterBill: true,
  electricityBill: true,
  status: true,
} as const;

function buildPropertyInclude(user: JwtPayloadUser, includeUnits = false) {
  const isBrowsingUser = user.role === UserRole.USER;

  return {
    owner: {
      select: isBrowsingUser
        ? { id: true, fullName: true }
        : { id: true, fullName: true, email: true, role: true },
    },
    images: {
      orderBy: { sortOrder: 'asc' as const },
    },
    units:
      includeUnits && isBrowsingUser
        ? {
            where: { status: 'VACANT' as const },
            select: unitSelect,
            orderBy: { unitNumber: 'asc' as const },
          }
        : false,
    _count: {
      select: { units: true, images: true },
    },
  };
}

@Injectable()
export class PropertiesService {
  constructor(
    private prisma: PrismaService,
    private r2: CloudflareR2Service,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, user: JwtPayloadUser) {
    const ownerId = await this.resolveOwnerId(createPropertyDto.ownerId, user);

    const property = await this.prisma.property.create({
      data: {
        name: createPropertyDto.name,
        location: createPropertyDto.location,
        description: createPropertyDto.description,
        totalUnits: createPropertyDto.totalUnits,
        ownerId,
      },
      include: buildPropertyInclude(user),
    });

    return {
      message: 'Property created successfully',
      property,
    };
  }

  async findAll(user: JwtPayloadUser, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildListWhere(user);
    const { skip, take } = buildSkipTake(page, limit);

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        include: buildPropertyInclude(user),
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data: properties, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: string, user: JwtPayloadUser) {
    const property = await this.findPropertyOrThrow(id, user, true);
    this.assertCanView(property.ownerId, user);
    return { property };
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    user: JwtPayloadUser,
  ) {
    if (
      updatePropertyDto.name === undefined &&
      updatePropertyDto.location === undefined &&
      updatePropertyDto.description === undefined &&
      updatePropertyDto.totalUnits === undefined
    ) {
      throw new BadRequestException('At least one field must be provided');
    }

    const existing = await this.findPropertyOrThrow(id, user);
    this.assertCanManage(existing.ownerId, user);

    const property = await this.prisma.property.update({
      where: { id },
      data: {
        ...(updatePropertyDto.name !== undefined && {
          name: updatePropertyDto.name,
        }),
        ...(updatePropertyDto.location !== undefined && {
          location: updatePropertyDto.location,
        }),
        ...(updatePropertyDto.description !== undefined && {
          description: updatePropertyDto.description,
        }),
        ...(updatePropertyDto.totalUnits !== undefined && {
          totalUnits: updatePropertyDto.totalUnits,
        }),
      },
      include: buildPropertyInclude(user),
    });

    return {
      message: 'Property updated successfully',
      property,
    };
  }

  async remove(id: string, user: JwtPayloadUser) {
    const property = await this.findPropertyOrThrow(id, user);
    this.assertCanManage(property.ownerId, user);

    if (property._count.units > 0) {
      throw new BadRequestException(
        'Cannot delete a property that has units. Remove units first.',
      );
    }

    await this.deleteImageFiles(property.images);
    await this.prisma.property.delete({ where: { id } });

    return { message: 'Property deleted successfully' };
  }

  async uploadImages(
    propertyId: string,
    files: Express.Multer.File[],
    user: JwtPayloadUser,
  ) {
    if (!files?.length) {
      throw new BadRequestException('At least one image file is required');
    }

    const property = await this.findPropertyOrThrow(propertyId, user);
    this.assertCanManage(property.ownerId, user);

    const existingCount = property._count.images;
    if (existingCount + files.length > 10) {
      throw new BadRequestException('A property can have at most 10 images');
    }

    const uploadedKeys: string[] = [];

    try {
      const createdImages: Array<{
        id: string;
        url: string;
        caption: string | null;
        sortOrder: number;
        propertyId: string;
        createdAt: Date;
      }> = [];

      for (const [index, file] of files.entries()) {
        const filename = this.r2.buildUniqueFilename(file.originalname);
        const key = this.r2.buildPropertyImageKey(propertyId, filename);
        const url = await this.r2.uploadObject(key, file.buffer, file.mimetype);
        uploadedKeys.push(key);

        const image = await this.prisma.propertyImage.create({
          data: {
            propertyId,
            url,
            sortOrder: existingCount + index,
          },
        });
        createdImages.push(image);
      }

      return {
        message: `${createdImages.length} image(s) uploaded successfully`,
        images: createdImages,
      };
    } catch (error) {
      await this.cleanupR2Objects(uploadedKeys);
      throw new InternalServerErrorException(
        'Failed to upload property images to Cloudflare R2',
        { cause: error },
      );
    }
  }

  async removeImage(
    propertyId: string,
    imageId: string,
    user: JwtPayloadUser,
  ) {
    const property = await this.findPropertyOrThrow(propertyId, user);
    this.assertCanManage(property.ownerId, user);

    const image = await this.prisma.propertyImage.findFirst({
      where: { id: imageId, propertyId },
    });
    if (!image) {
      throw new NotFoundException('Property image not found');
    }

    await this.prisma.propertyImage.delete({ where: { id: imageId } });
    await this.deleteImageFile(image.url);

    return { message: 'Property image deleted successfully' };
  }

  private buildListWhere(user: JwtPayloadUser) {
    if (user.role === UserRole.LANDLORD) {
      return { ownerId: user.userId };
    }
    return undefined;
  }

  private async resolveOwnerId(
    ownerId: string | undefined,
    user: JwtPayloadUser,
  ): Promise<string> {
    if (user.role === UserRole.ADMIN) {
      if (!ownerId) {
        throw new BadRequestException(
          'ownerId is required when an admin creates a property',
        );
      }

      const landlord = await this.prisma.user.findUnique({
        where: { id: ownerId },
      });
      if (!landlord) {
        throw new NotFoundException('Landlord not found');
      }
      if (landlord.role !== UserRole.LANDLORD) {
        throw new BadRequestException('ownerId must belong to a landlord');
      }
      return ownerId;
    }

    if (user.role === UserRole.LANDLORD) {
      if (ownerId && ownerId !== user.userId) {
        throw new ForbiddenException(
          'Landlords can only create properties for themselves',
        );
      }
      return user.userId;
    }

    throw new ForbiddenException(
      'You do not have permission to create properties',
    );
  }

  private assertCanView(ownerId: string, user: JwtPayloadUser): void {
    if (user.role === UserRole.USER || user.role === UserRole.ADMIN) {
      return;
    }
    if (user.role === UserRole.LANDLORD && ownerId === user.userId) {
      return;
    }
    throw new ForbiddenException('You do not have access to this property');
  }

  private assertCanManage(ownerId: string, user: JwtPayloadUser): void {
    if (user.role === UserRole.ADMIN) {
      return;
    }
    if (user.role === UserRole.LANDLORD && ownerId === user.userId) {
      return;
    }
    throw new ForbiddenException('You do not have access to this property');
  }

  private async findPropertyOrThrow(
    id: string,
    user: JwtPayloadUser,
    includeUnits = false,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: buildPropertyInclude(user, includeUnits),
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  private async cleanupR2Objects(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map((key) => this.r2.deleteObject(key).catch(() => undefined)),
    );
  }

  private async deleteImageFiles(
    images: Array<{ url: string }>,
  ): Promise<void> {
    await Promise.all(images.map((image) => this.deleteImageFile(image.url)));
  }

  private async deleteImageFile(url: string): Promise<void> {
    const key = this.r2.getObjectKeyFromUrl(url);
    if (!key) {
      return;
    }

    try {
      await this.r2.deleteObject(key);
    } catch {
      // Object may already be missing in R2
    }
  }
}
