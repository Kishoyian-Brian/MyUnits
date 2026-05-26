import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { buildEmailHtml } from './email-layout';

export interface WelcomeEmailData {
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    try {
      await this.sendMail({
        to: data.email,
        subject: `Welcome to MyUnits, ${data.name}!`,
        title: 'Welcome to MyUnits',
        body: `
          <p>Hi <strong>${data.name}</strong>,</p>
          <p>Your account has been created successfully on <strong>${data.createdAt}</strong>.</p>
          <p>You are registered as a <strong>${data.role}</strong>. You can now log in and start managing your properties.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>— The MyUnits Team</p>
        `,
      });
      this.logger.log(`Welcome email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${data.email}`, error);
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const appUrl = process.env.APP_URL ?? 'http://localhost:4200';
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Verify your MyUnits email',
      title: 'Verify your email',
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verifyUrl}">Verify my email</a></p>
        <p>Or copy this link: ${verifyUrl}</p>
        <p>If you did not create an account, you can ignore this email.</p>
        <p>— The MyUnits Team</p>
      `,
    });
    this.logger.log(`Verification email sent to ${email}`);
  }

  async sendPasswordResetOtp(
    email: string,
    otp: string,
    name: string,
  ): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Password Reset OTP - MyUnits',
      title: 'Password reset',
      body: `
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Use the OTP below:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <p style="margin-top: 10px; color: #666; font-size: 14px;">Enter this code in the password reset form</p>
        </div>
        <div class="warning">
          <strong>Security notice:</strong>
          <ul>
            <li>This OTP expires in <strong>15 minutes</strong></li>
            <li>Never share this code with anyone</li>
            <li>If you didn't request this, ignore this email</li>
          </ul>
        </div>
      `,
    });
    this.logger.log(`Password reset OTP sent to ${email}`);
  }

  private async sendMail(options: {
    to: string;
    subject: string;
    title: string;
    body: string;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: `"MyUnits" <${process.env.MAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: buildEmailHtml({
        title: options.title,
        body: options.body,
      }),
    });
  }
}
