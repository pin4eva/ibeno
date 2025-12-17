import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { environments } from '../utils/environments';
import * as Brevo from '@getbrevo/brevo';
console.log('Brevo API Key: ', environments.BREVO_API_KEY);

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
      await this.brevo.sendTransacEmail(sendSmtpEmail).catch((error) => {
        console.log({ error });

        this.logger.error(`Failed to send email to ${payload.to}: ${error.message}`);
        throw new BadRequestException('Failed to send email');
      });
      this.logger.log(`Email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${payload.to}: ${error.message}`);
      throw new BadRequestException('Failed to send email');
    }
  }

  // send reset password email
  async sendResetPasswordEmail(to: string, name: string, resetLink: string) {
    const subject = 'Password Reset Request';
    const htmlContent = `
      <p>Dear ${name},</p>
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

  // password update required email
  async sendPasswordUpdateRequiredEmail(to: string, name: string, updateLink: string) {
    const subject = 'Password Update Required';
    const htmlContent = `
      <p>Dear ${name},</p>
      <p>For security reasons, you are required to update your password. Click the link below to update your password:</p>
      <a href="${updateLink}">Update Password</a>
      <p>If you have any questions, please contact support.</p>
      <p>Best regards,<br/>IHCDT Team</p>
    `;
    await this.sendEmail({ to, subject, htmlContent });
  }
}
