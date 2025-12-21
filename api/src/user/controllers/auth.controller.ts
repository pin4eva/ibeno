import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { ChangePasswordDTO, InviteUserDTO, LoginDTO, SignupDTO } from '../dto/auth.dto';
import { type Request } from 'express';
import { AuthGuard } from '../../guards/auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { type User } from '../../generated/client';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login
  @Post('login')
  async login(@Body() input: LoginDTO, @Req() req: Request) {
    return this.authService.login(input, req.headers.origin || '');
  }

  // signup
  @Post('signup')
  async signup(@Body() input: SignupDTO) {
    return this.authService.signup(input);
  }

  // invite user
  @Post('invite')
  async inviteUser(@Body() input: InviteUserDTO) {
    return this.authService.inviteUser(input);
  }

  // reset password
  @Post('forgot-password')
  async resetPassword(@Body('email') email: string, @Req() req: Request) {
    const origin = req.headers.origin || '';
    return this.authService.sendResetPasswordEmail(email, origin);
  }

  // change password
  @Post('reset-password')
  changePassword(@Body() input: ChangePasswordDTO) {
    return this.authService.changePassword(input);
  }

  // send invitation email
  @Patch('send-invitation-email')
  sendInvitationEmail(@Body('email') email: string, @Req() req: Request) {
    const origin = req.headers.origin || '';
    return this.authService.sendInvitationEmail(email, origin);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: User) {
    return user;
  }
}
