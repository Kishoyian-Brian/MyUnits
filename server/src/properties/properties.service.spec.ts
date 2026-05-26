import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareR2Service } from '../storage/cloudflare-r2.service';

describe('PropertiesService', () => {
  let service: PropertiesService;

  const landlordUser = {
    userId: 'landlord-uuid',
    email: 'landlord@example.com',
    role: 'LANDLORD' as const,
  };

  const regularUser = {
    userId: 'user-uuid',
    email: 'user@example.com',
    role: 'USER' as const,
  };

  const adminUser = {
    userId: 'admin-uuid',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
  };

  const mockProperty = {
    id: 'property-uuid',
    name: 'Sunset Apartments',
    location: 'Nairobi',
    description: 'Test',
    totalUnits: 10,
    ownerId: landlordUser.userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: {
      id: landlordUser.userId,
      fullName: 'Jane Landlord',
      email: landlordUser.email,
      role: 'LANDLORD',
    },
    images: [],
    _count: { units: 0, images: 0 },
  };

  const prisma = {
    property: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    propertyImage: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };

  const r2 = {
    buildUniqueFilename: jest.fn((name: string) => `file${name}`),
    buildPropertyImageKey: jest.fn(
      (propertyId: string, filename: string) =>
        `properties/${propertyId}/${filename}`,
    ),
    uploadObject: jest.fn(),
    deleteObject: jest.fn(),
    getObjectKeyFromUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: prisma },
        { provide: CloudflareR2Service, useValue: r2 },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('landlord creates property for themselves', async () => {
    prisma.property.create.mockResolvedValue(mockProperty);

    const result = await service.create(
      {
        name: 'Sunset Apartments',
        location: 'Nairobi',
        totalUnits: 10,
      },
      landlordUser,
    );

    expect(prisma.property.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ownerId: landlordUser.userId }),
      }),
    );
    expect(result.property.name).toBe('Sunset Apartments');
  });

  it('regular user can view any property', async () => {
    prisma.property.findUnique.mockResolvedValue(mockProperty);

    const result = await service.findOne(mockProperty.id, regularUser);

    expect(result.property.id).toBe(mockProperty.id);
  });

  it('regular user cannot update property', async () => {
    prisma.property.findUnique.mockResolvedValue(mockProperty);

    await expect(
      service.update(mockProperty.id, { name: 'Hack' }, regularUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('admin must provide ownerId when creating property', async () => {
    await expect(
      service.create(
        { name: 'Test', location: 'Nairobi', totalUnits: 5 },
        adminUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('findOne throws when property not found', async () => {
    prisma.property.findUnique.mockResolvedValue(null);

    await expect(
      service.findOne('missing', landlordUser),
    ).rejects.toThrow(NotFoundException);
  });
});
