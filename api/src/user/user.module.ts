import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { InvitationService } from './services/invitation.service';
import { InvitationController } from './controllers/invitation.controller';

@Module({
  controllers: [UserController, AuthController, InvitationController],
  providers: [UserService, AuthService, InvitationService],
  exports: [UserService, AuthService],
})
export class UserModule {}
