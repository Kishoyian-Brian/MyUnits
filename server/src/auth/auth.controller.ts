import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayloadUser } from './types/jwt-payload';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Register request received for ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Log in with email and password' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login request received for ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Verify email with token' })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    this.logger.log('Verify email request received');
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @ApiOperation({ summary: 'Resend email verification link' })
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  resendVerification(@Body() resendDto: ResendVerificationDto) {
    this.logger.log(`Resend verification request for ${resendDto.email}`);
    return this.authService.resendVerification(resendDto);
  }

  @ApiOperation({ summary: 'Request a password reset OTP' })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDto: ForgetPasswordDto) {
    this.logger.log(
      `Forgot password request received for ${forgotPasswordDto.email}`,
    );
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiOperation({ summary: 'Reset password with OTP' })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    this.logger.log(
      `Reset password request received for ${resetPasswordDto.email}`,
    );
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.log('Refresh token request received');
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @ApiOperation({ summary: 'Log out current user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: JwtPayloadUser) {
    this.logger.log(`Logout request for ${user.email}`);
    return this.authService.logout(user.userId);
  }
}
