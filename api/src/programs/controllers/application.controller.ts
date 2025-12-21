import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApplicationService } from '../services/application.service';
import {
  ApplicantLoginDTO,
  ApplicationDTO,
  CreateBankDetailDTO,
  CreateDocumentUploadDTO,
  CreateSchoolRecordDTO,
  FilterApplicationsDTO,
} from '../dto/application.dto';

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

  @Patch('submit-application')
  submitApplication(@Body('id') id: number) {
    return this.applicationService.submitApplication(id);
  }

  // bank details
  @Post('bank-detail')
  createBankDetails(@Body() input: CreateBankDetailDTO) {
    return this.applicationService.updateBankDetails(input);
  }

  // documents
  @Post('documents')
  uploadDocuments(@Body() input: CreateDocumentUploadDTO) {
    return this.applicationService.uploadDocuments(input);
  }

  // school records
  @Post('school-record')
  uploadSchoolRecords(@Body() input: CreateSchoolRecordDTO) {
    return this.applicationService.updateSchoolRecord(input);
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
