import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ProgramsService } from '../services/programs.service';
import { CreateProgramDTO, FilterProgramsDTO, UpdateProgramDTO } from '../dto/programs.dto';

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
  createProgram(@Body() input: CreateProgramDTO) {
    return this.programsService.createProgram(input);
  }

  // Update program
  @Put()
  updateProgram(@Body() input: UpdateProgramDTO) {
    return this.programsService.updateProgram(input);
  }
  // Delete program
  @Post('single/:id')
  deleteProgram(@Param('id') id: number) {
    return this.programsService.deleteProgram(id);
  }

  // Open or close program enrollment
  @Post('enrollment/:id/toggle')
  toggleProgramEnrollment(@Param('id') id: number) {
    return this.programsService.toggleProgramEnrollment(id);
  }
}
