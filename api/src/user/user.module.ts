import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService],
  exports: [UserService, AuthService],
})
export class UserModule {}
