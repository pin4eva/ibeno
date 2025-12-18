import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDTO, UserFilterDTO } from '../dto/user.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query() filter: UserFilterDTO) {
    return this.userService.getUsers(filter);
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
  async remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
