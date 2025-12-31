import { Body, Controller, Delete, Get, Patch, Post, Put, Req } from '@nestjs/common';
import { InvitationService } from '../services/invitation.service';
import { InvitationDTO } from '../dto/invitation.dto';
import { type Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Invitation')
@ApiBearerAuth()
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get()
  async getInvitations() {
    return this.invitationService.getInvitations();
  }

  @Post()
  inviteUser(@Body() input: InvitationDTO, @Req() request: Request) {
    const origin = request.headers.origin || '';
    return this.invitationService.createInvitation(input, origin);
  }

  @Patch('resend')
  resendInvitation(@Body('email') email: string, @Req() request: Request) {
    const origin = request.headers.origin || '';

    return this.invitationService.sendInvitationEmail(email, origin);
  }

  @Delete(':id')
  deleteInvitation(@Body('id') id: number) {
    return this.invitationService.deleteInvitation(id);
  }
}
