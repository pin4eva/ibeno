import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApplicationService } from '../services/application.service';
import { ApplicantLoginDTO, ApplicationDTO, FilterApplicationsDTO } from '../dto/application.dto';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post('migrate')
  async migrateOldApplications() {
    return this.applicationService.importApplications();
  }

  @Post('login')
  login(@Body() input: ApplicantLoginDTO) {
    return this.applicationService.login(input);
  }

  @Post()
  startApplication(@Body() input: ApplicationDTO) {
    return this.applicationService.createApplication(input);
  }

  @Get()
  getAllApplications(@Query() query?: FilterApplicationsDTO) {
    return this.applicationService.getAllApplications(query);
  }

  @Get('single/:id')
  getApplicationById(@Param('id') id: number) {
    return this.applicationService.getApplicationById(id);
  }
}
