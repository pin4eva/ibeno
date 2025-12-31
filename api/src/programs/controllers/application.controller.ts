import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRoleEnum } from '../../generated/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';
import {
  ApplicantLoginDTO,
  ApplicationDTO,
  CreateBankDetailDTO,
  CreateDocumentUploadDTO,
  CreateSchoolRecordDTO,
  FilterApplicationsDTO,
  BulkDeleteApplicationsDTO,
} from '../dto/application.dto';
import { ApplicationService } from '../services/application.service';
import { type Request } from 'express';

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

  @Post('passport')
  uploadPassport(@Body() input: { applicationId: number; passport: string }) {
    return this.applicationService.uploadPassport(input.applicationId, input.passport);
  }

  @Post()
  startApplication(@Body() input: ApplicationDTO, @Req() req: Request) {
    return this.applicationService.createApplication(input, req.headers.origin || '');
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
  @UseGuards(AuthGuard)
  getAllApplications(@Query() query?: FilterApplicationsDTO) {
    return this.applicationService.getAllApplications(query);
  }

  @Get('single/:id')
  getApplicationById(@Param('id') id: number) {
    return this.applicationService.getApplicationById(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  updateApplicationStatus(
    @Param('id') id: number,
    @Body() input: { status: string; comment?: string },
  ) {
    return this.applicationService.updateApplicationStatus(id, input.status as any, input.comment);
  }

  @Post('student-history')
  getStudentApplications(@Body('nin') nin: string) {
    return this.applicationService.getStudentApplications(nin);
  }

  @Post('bulk-send-started/:programId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor)
  bulkSendApplicationStartedEmail(
    @Param('programId') programId: number,
    @Body('origin') origin?: string,
  ) {
    return this.applicationService.bulkSendApplicationStartedEmail(programId, origin || '');
  }

  @Delete('bulk-delete')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor)
  bulkDelete(@Body() body: BulkDeleteApplicationsDTO) {
    return this.applicationService.bulkDeleteApplications(body.ids || []);
  }
}
