import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProgramsService } from '../services/programs.service';
import { CreateProgramDTO, FilterProgramsDTO, UpdateProgramDTO } from '../dto/programs.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRoleEnum } from '../../generated/enums';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  // Get all programs
  @Get()
  async getAllPrograms(@Query() filter?: FilterProgramsDTO) {
    return this.programsService.getAllPrograms(filter);
  }

  // Get program by id
  @Get('single/:id')
  async getProgramById(@Param('id') id: number) {
    return this.programsService.getProgramById(id);
  }

  // Create program
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor)
  createProgram(@Body() input: CreateProgramDTO) {
    return this.programsService.createProgram(input);
  }

  // Update program
  @Put()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor)
  updateProgram(@Body() input: UpdateProgramDTO) {
    return this.programsService.updateProgram(input);
  }
  // Delete program
  @Post('single/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin)
  deleteProgram(@Param('id') id: number) {
    return this.programsService.deleteProgram(id);
  }

  // Open or close program enrollment
  @Patch(':id/status')
  @UseGuards(AuthGuard)
  toggleProgramEnrollment(@Param('id') id: number) {
    return this.programsService.toggleProgramEnrollment(id);
  }
}
