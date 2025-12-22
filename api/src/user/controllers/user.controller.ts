import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChangeProfilePasswordDTO, UpdateProfileDTO, UpdateUserDTO, UserFilterDTO } from '../dto/user.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { type User } from '../../generated/client';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRoleEnum } from '../../generated/enums';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query() filter: UserFilterDTO) {
    return this.userService.getUsers(filter);
  }

  @Patch('migrate')
  migrateUsers() {
    return this.userService.importUserAndAuth();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateUserDTO) {
    return this.userService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin)
  async remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  async updateProfile(@CurrentUser() user: User, @Body() data: UpdateProfileDTO) {
    return this.userService.updateProfile(user.id, data);
  }

  @Patch('profile/password')
  @UseGuards(AuthGuard)
  async changePassword(@CurrentUser() user: User, @Body() data: ChangeProfilePasswordDTO) {
    return this.userService.changeProfilePassword(user.id, data);
  }
}
