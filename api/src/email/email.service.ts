import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { environments } from '../utils/environments';
import * as Brevo from '@getbrevo/brevo';
import { MongoClient } from 'mongodb';

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
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = payload.subject;
    sendSmtpEmail.htmlContent = payload.htmlContent || '';
    sendSmtpEmail.sender = {
      email: environments.MAIL_SENDER.email,
      name: environments.MAIL_SENDER.name,
    };
    sendSmtpEmail.to = [{ email: payload.to }];

    try {
      await this.brevo.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Email sent to ${payload.to}`);
      // Log success to MongoDB
      await this.logEmailEvent({ to: payload.to, subject: payload.subject, status: 'sent' });
    } catch (error) {
      // Log failure to MongoDB (best-effort)
      await this.logEmailEvent({
        to: payload.to,
        subject: payload.subject,
        status: 'failed',
        errorMessage: error?.message || String(error),
      });
      this.logger.error(`Failed to send email to ${payload.to}: ${error?.message || error}`);
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
    `;
    await this.sendEmail({ to, subject, htmlContent });
  }

  async sendApplicationStartedEmail(
    to: string,
    name: string,
    applicationNo: string,
    programName: string,
    loginUrl: string,
  ) {
    const subject = 'Application Started - IHCDT';
    const htmlContent = `
      <p>Dear ${name},</p>
      <p>You have successfully started your application for <strong>${programName}</strong>.</p>
      <p>Your Application Number is: <strong>${applicationNo}</strong></p>
      <p>Please use this number and your NIN to log in and complete your application.</p>
      <p><a href="${loginUrl}/applications/login">Login to Dashboard</a></p>
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
      <a href="${invitationLink}">Accept Invitation</a> or copy and paste the following URL into your browser:</p>
      <p>${invitationLink}</p>

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

  // send application status update email
  async sendApplicationStatusUpdate(
    to: string,
    name: string,
    applicationNo: string,
    statusMessage: string,
    comment?: string,
  ) {
    const subject = `Application Status Update - ${applicationNo}`;
    const htmlContent = `
      <p>Dear ${name},</p>
      <p>Your application <strong>${applicationNo}</strong> ${statusMessage}.</p>
      ${comment ? `<p><strong>Reviewer Comment:</strong> ${comment}</p>` : ''}
      <p>You can log in to check your application status and details.</p>
      <p>Best regards,<br/>IHCDT Team</p>
    `;
    await this.sendEmail({ to, subject, htmlContent });
  }

  private async logEmailEvent({
    to,
    subject,
    status,
    errorMessage,
  }: {
    to: string;
    subject: string;
    status: 'sent' | 'failed';
    errorMessage?: string | null;
  }) {
    const mongoUrl = environments.MONGO_URL;
    if (!mongoUrl) {
      this.logger.warn('MONGO_URL is not configured; skipping email logging');
      return;
    }

    const client = new MongoClient(mongoUrl);
    try {
      await client.connect();
      const db = client.db();
      const col = db.collection('emails');
      await col.insertOne({
        to,
        subject,
        status,
        errorMessage: errorMessage ?? null,
        createdAt: new Date(),
      });
    } catch (err) {
      this.logger.error(`Failed to write email log to MongoDB: ${err?.message || err}`);
      // do not throw — logging should be best-effort
    } finally {
      try {
        await client.close();
      } catch (e) {
        // ignore
      }
    }
  }
}
