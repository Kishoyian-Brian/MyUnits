import { Test, TestingModule } from '@nestjs/testing';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';

describe('PropertiesController', () => {
  let controller: PropertiesController;

  const propertiesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [{ provide: PropertiesService, useValue: propertiesService }],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to propertiesService', async () => {
    propertiesService.create.mockResolvedValue({ property: { id: 'property-uuid' } });

    await controller.create(
      { userId: 'landlord-uuid', email: 'landlord@example.com', role: 'LANDLORD' },
      { name: 'Test', location: 'Nairobi', totalUnits: 5 },
    );

    expect(propertiesService.create).toHaveBeenCalled();
  });
});
