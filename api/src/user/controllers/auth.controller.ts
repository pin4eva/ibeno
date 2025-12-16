import { Body, Controller, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { InviteUserDTO, LoginDTO, SignupDTO } from '../dto/auth.dto';
import { type Request } from 'express';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login
  @Post('login')
  async login(@Body() input: LoginDTO) {
    return this.authService.login(input);
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
  @Post('reset-password')
  async resetPassword(@Body('email') email: string, @Req() req: Request) {
    const origin = req.headers.origin || '';
    return this.authService.sendResetPasswordEmail(email, origin);
  }

  // change password
  @Post('change-password')
  changePassword(@Body('otp') otp: number) {
    return this.authService.changePassword(otp);
  }

  // send invitation email
  @Patch('send-invitation-email')
  sendInvitationEmail(@Body('email') email: string, @Req() req: Request) {
    const origin = req.headers.origin || '';
    return this.authService.sendInvitationEmail(email, origin);
  }
}
