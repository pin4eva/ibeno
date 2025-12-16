import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { environments } from '../utils/environments';
import * as Brevo from '@getbrevo/brevo';

export class EmailPayload {
  to: string;
  subject: string;
  htmlContent?: string;
}

@Injectable()
export class EmailService {
  private readonly brevo: Brevo.TransactionalEmailsApi;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.brevo = new Brevo.TransactionalEmailsApi();
    this.brevo.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, environments.BREVO_API_KEY);
  }

  // send email
  async sendEmail(payload: EmailPayload) {
    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = payload.subject;
      sendSmtpEmail.htmlContent = payload.htmlContent || '';
      sendSmtpEmail.sender = {
        email: environments.MAIL_SENDER.email,
        name: environments.MAIL_SENDER.name,
      };
      sendSmtpEmail.to = [{ email: payload.to }];
      await this.brevo.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${payload.to}: ${error.message}`);
      throw new BadRequestException('Failed to send email');
    }
  }

  // send reset password email
  async sendResetPasswordEmail(to: string, resetLink: string) {
    const subject = 'Password Reset Request';
    const htmlContent = `
      <p>Dear User,</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br/>IHCDT Team</p>
    `;
    await this.sendEmail({ to, subject, htmlContent });
  }

  // send invitation email
  async sendInvitationEmail(to: string, invitationLink: string) {
    const subject = 'You are Invited to Join IHCDT';
    const htmlContent = `
      <p>Dear User,</p>
      <p>You have been invited to join IHCDT. Click the link below to accept the invitation and sign up:</p>
      <a href="${invitationLink}">Accept Invitation</a>
      <p>We look forward to having you with us!</p>
      <p>Best regards,<br/>IHCDT Team</p>
    `;
    await this.sendEmail({ to, subject, htmlContent });
  }
}
