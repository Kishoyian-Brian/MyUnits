import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-uuid',
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'hashed',
    phoneNumber: null,
    role: 'LANDLORD',
    isEmailVerified: true,
    emailVerificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const mailerService = {
    sendWelcomeEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailerService, useValue: mailerService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getProfile returns sanitized user', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.getProfile(mockUser.id);

    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe(mockUser.email);
  });

  it('getProfile throws when user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getProfile('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updateProfile throws when no fields provided', async () => {
    await expect(service.updateProfile(mockUser.id, {})).rejects.toThrow(
      BadRequestException,
    );
  });

  it('updateProfile updates user', async () => {
    prisma.user.update.mockResolvedValue({
      ...mockUser,
      fullName: 'New Name',
    });

    const result = await service.updateProfile(mockUser.id, {
      fullName: 'New Name',
    });

    expect(result.message).toBe('Profile updated successfully');
    expect(result.user.fullName).toBe('New Name');
  });

  it('findAll returns sanitized users', async () => {
    prisma.user.findMany.mockResolvedValue([mockUser]);

    const result = await service.findAll();

    expect(result.users).toHaveLength(1);
    expect(result.users[0]).not.toHaveProperty('password');
  });
});
