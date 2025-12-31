import { BadRequestException, Injectable } from '@nestjs/common';
import { InvitationDTO, UpdateInvitationDTO } from '../dto/invitation.dto';
import { PrismaService } from '../../prisma.service';
import { randomBytes } from 'crypto';
import { EmailService } from '../../email/email.service';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // get all invitations
  async getInvitations() {
    return this.prisma.invitation.findMany();
  }

  // invite users
  async createInvitation(data: InvitationDTO, origin: string) {
    const { department, role } = data;
    const email = data.email.toLowerCase().trim();
    try {
      const existingInvitation = await this.prisma.invitation.findUnique({
        where: { email },
      });
      if (existingInvitation) {
        throw new BadRequestException('Invitation already sent to this email');
      }
      const token = randomBytes(16).toString('hex');

      const href = `${origin}/signup?token=${token}`;

      await this.emailService.sendInvitationEmail(email, href);

      const invitation = await this.prisma.invitation.create({
        data: {
          email,
          role,
          department,
          token,
        },
      });
      return invitation;
    } catch (error) {
      throw error;
    }
  }

  // send invitation email
  async sendInvitationEmail(email: string, origin: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { email },
    });
    if (!invitation) {
      throw new BadRequestException('No invitation found for this email');
    }
    const href = `${origin}/signup?token=${invitation.token}`;
    await this.emailService.sendInvitationEmail(email, href);
  }

  // delete invitation
  async deleteInvitation(id: number) {
    return this.prisma.invitation.delete({
      where: { id },
    });
  }

  // update invitation
  async updateInvitation(input: UpdateInvitationDTO) {
    const { id, ...rest } = input;
    try {
      const invitation = await this.prisma.invitation.findUnique({
        where: { id },
      });
      if (!invitation) {
        throw new BadRequestException('Invitation not found');
      }
      return this.prisma.invitation.update({
        where: { id },
        data: rest,
      });
    } catch (error) {
      throw error;
    }
  }
}
