/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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
      await this.transporter.sendMail({
        from: `"MyUnits" <${process.env.MAIL_USER}>`,
        to: data.email,
        subject: `Welcome to MyUnits, ${data.name}!`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; background: #f9f9f9; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; }
              .header { background-color: #1d4ed8; color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; background: #f8f9fa; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to MyUnits </h1>
              </div>
              <div class="content">
                <p>Hi <strong>${data.name}</strong>,</p>
                <p>Your account has been created successfully on <strong>${data.createdAt}</strong>.</p>
                <p>You are registered as a <strong>${data.role}</strong>. You can now log in and start managing your properties.</p>
                <p>If you have any questions, feel free to reach out to our support team.</p>
                <p>— The MyUnits Team</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} MyUnits. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      this.logger.log(`Welcome email sent to ${data.email}`);
    } catch (error) {
      // Don't throw — email failure should not break registration
      this.logger.error(`Failed to send welcome email to ${data.email}`, error);
    }
  }

  async sendPasswordResetOtp(
    email: string,
    otp: string,
    name: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"MyUnits" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP - MyUnits',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; background: #f9f9f9; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; }
              .header { background-color: #1d4ed8; color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .otp-box { background: #f0f4ff; border: 2px dashed #1d4ed8; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }
              .otp-code { font-size: 36px; font-weight: bold; color: #1d4ed8; letter-spacing: 8px; font-family: monospace; }
              .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; background: #f8f9fa; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>MyUnits </h1>
              </div>
              <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>We received a request to reset your password. Use the OTP below:</p>

                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                  <p style="margin-top: 10px; color: #666; font-size: 14px;">Enter this code in the password reset form</p>
                </div>

                <div class="warning">
                  <strong>Security Notice:</strong>
                  <ul>
                    <li>This OTP expires in <strong>15 minutes</strong></li>
                    <li>Never share this code with anyone</li>
                    <li>If you didn't request this, ignore this email</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} MyUnits. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      this.logger.log(`Password reset OTP sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error);
    }
  }
}
