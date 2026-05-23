import { Test, TestingModule } from '@nestjs/testing';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getMe delegates to usersService.getProfile', async () => {
    usersService.getProfile.mockResolvedValue({ user: { id: 'user-uuid' } });

    await controller.getMe({
      userId: 'user-uuid',
      email: 'test@example.com',
      role: 'LANDLORD',
    });

    expect(usersService.getProfile).toHaveBeenCalledWith('user-uuid');
  });
});
