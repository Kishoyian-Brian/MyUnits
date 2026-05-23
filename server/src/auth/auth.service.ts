import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailerService } from '../mailer/mailer.service';
import { ForgetPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { sanitizeUser } from './utils/sanitize-user';
import { JwtPayload, JwtPayloadUser } from './types/jwt-payload';
import { User } from '../generated/prisma/client';

const GENERIC_PASSWORD_RESET_MESSAGE =
  'If an account exists for this email, a reset code has been sent.';
const GENERIC_RESEND_VERIFICATION_MESSAGE =
  'If an account exists and is unverified, a verification email has been sent.';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const emailVerificationToken = randomBytes(32).toString('hex');

    const user = await this.prisma.user.create({
      data: {
        fullName: registerDto.fullName,
        email: registerDto.email,
        password: hashedPassword,
        role: 'USER',
        emailVerificationToken,
      },
    });

    try {
      await this.mailerService.sendVerificationEmail(
        user.email,
        user.fullName,
        emailVerificationToken,
      );
    } catch {
      // Registration succeeds even if verification email fails
    }

    try {
      await this.mailerService.sendWelcomeEmail({
        name: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: new Date().toLocaleDateString('en-KE', { dateStyle: 'long' }),
      });
    } catch {
      // Welcome email is non-blocking
    }

    return {
      message:
        'User registered successfully. Please verify your email before logging in.',
      user: sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email not verified. Please check your inbox or request a new verification link.',
      );
    }

    const tokens = await this.issueTokens(user);

    return {
      ...tokens,
      user: sanitizeUser(user),
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: verifyEmailDto.token },
    });
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    return {
      message: 'Email verified successfully',
      user: sanitizeUser(updated),
    };
  }

  async resendVerification(resendDto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: resendDto.email },
    });

    if (user && !user.isEmailVerified) {
      const token =
        user.emailVerificationToken ?? randomBytes(32).toString('hex');

      if (!user.emailVerificationToken) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerificationToken: token },
        });
      }

      try {
        await this.mailerService.sendVerificationEmail(
          user.email,
          user.fullName,
          token,
        );
      } catch {
        throw new InternalServerErrorException(
          'Failed to send verification email. Please try again later.',
        );
      }
    }

    return { message: GENERIC_RESEND_VERIFICATION_MESSAGE };
  }

  async forgotPassword(forgetPasswordDto: ForgetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgetPasswordDto.email },
    });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: hashedOtp,
          resetPasswordExpires: otpExpiry,
        },
      });

      try {
        await this.mailerService.sendPasswordResetOtp(
          user.email,
          otp,
          user.fullName,
        );
      } catch {
        throw new InternalServerErrorException(
          'Failed to send reset email. Please try again later.',
        );
      }
    }

    return { message: GENERIC_PASSWORD_RESET_MESSAGE };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: resetPasswordDto.email },
    });
    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const otpValid =
      user.resetPasswordToken &&
      (await bcrypt.compare(resetPasswordDto.otp, user.resetPasswordToken));
    const otpExpired =
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date();

    if (!otpValid || otpExpired) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        refreshToken: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(
        refreshTokenDto.refreshToken,
        { secret: refreshSecret },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (
      !user?.refreshToken ||
      !(await bcrypt.compare(refreshTokenDto.refreshToken, user.refreshToken))
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.issueTokens(user);

    return {
      ...tokens,
      user: sanitizeUser(user),
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  private async issueTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: 7 * 24 * 60 * 60,
    });

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    });

    return { accessToken, refreshToken };
  }
}
