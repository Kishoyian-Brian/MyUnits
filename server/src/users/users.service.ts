import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { sanitizeUser } from '../auth/utils/sanitize-user';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateLandlordDto } from './dto/create-landlord.dto';

function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  );
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async createLandlord(createLandlordDto: CreateLandlordDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createLandlordDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    try {
      const hashedPassword = await bcrypt.hash(createLandlordDto.password, 10);

      const landlord = await this.prisma.user.create({
        data: {
          fullName: createLandlordDto.fullName,
          email: createLandlordDto.email,
          password: hashedPassword,
          phoneNumber: createLandlordDto.phoneNumber,
          role: 'LANDLORD',
          isEmailVerified: true,
        },
      });

      try {
        await this.mailerService.sendWelcomeEmail({
          name: landlord.fullName,
          email: landlord.email,
          role: landlord.role,
          createdAt: new Date().toLocaleDateString('en-KE', {
            dateStyle: 'long',
          }),
        });
      } catch {
        // Landlord creation succeeds even if welcome email fails
      }

      return {
        message: 'Landlord created successfully',
        user: sanitizeUser(landlord),
      };
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new BadRequestException('Phone number already in use');
      }
      throw error;
    }
  }

  async getProfile(userId: string) {
    const user = await this.findUserOrThrow(userId);
    return { user: sanitizeUser(user) };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    if (
      updateProfileDto.fullName === undefined &&
      updateProfileDto.phoneNumber === undefined
    ) {
      throw new BadRequestException('At least one field must be provided');
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(updateProfileDto.fullName !== undefined && {
            fullName: updateProfileDto.fullName,
          }),
          ...(updateProfileDto.phoneNumber !== undefined && {
            phoneNumber: updateProfileDto.phoneNumber,
          }),
        },
      });
      return {
        message: 'Profile updated successfully',
        user: sanitizeUser(user),
      };
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        throw new BadRequestException('Phone number already in use');
      }
      throw error;
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { users: users.map(sanitizeUser) };
  }

  async findById(id: string) {
    const user = await this.findUserOrThrow(id);
    return { user: sanitizeUser(user) };
  }

  private async findUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
