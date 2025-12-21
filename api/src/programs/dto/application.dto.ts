import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { ProgramCategoryEnum } from './programs.dto';

export enum ApplicationStatusEnum {
  InProgress = 'In Progress',
  Submitted = 'Submitted',
  Reviewed = 'Reviewed',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}

export class FilterApplicationsDTO {
  @ApiPropertyOptional({ enum: ApplicationStatusEnum })
  @IsOptional()
  @IsIn([
    ApplicationStatusEnum.InProgress,
    ApplicationStatusEnum.Submitted,
    ApplicationStatusEnum.Reviewed,
    ApplicationStatusEnum.Accepted,
    ApplicationStatusEnum.Rejected,
  ])
  status?: ApplicationStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  programId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ProgramCategoryEnum)
  category?: ProgramCategoryEnum;
}

export class ApplicantLoginDTO {
  @ApiProperty({ description: 'Application Number' })
  @IsString()
  applicationNo: string;

  @ApiProperty({ description: 'National Identification Number' })
  @IsNumberString()
  nin: string;
}

export class ApplicationDTO {
  @ApiPropertyOptional({ description: 'ID of the application', required: false })
  @IsOptional()
  @IsInt()
  id?: number;
  @ApiProperty({ description: 'ID of the program applied for', required: true })
  @IsInt()
  programId: number;

  @ApiPropertyOptional({ description: 'Application number', required: false })
  @IsOptional()
  @IsString()
  applicationNo?: string;
  // Personal Information
  @ApiProperty({ description: 'First name of the applicant', required: true })
  @IsString()
  firstName: string;
  @ApiProperty({ description: 'Last name of the applicant', required: true })
  @IsString()
  lastName: string;
  @ApiPropertyOptional({ description: 'Middle name of the applicant', required: false })
  @IsOptional()
  @IsString()
  middleName?: string;
  @ApiProperty({ description: 'Email of the applicant', required: true })
  @IsEmail()
  email: string;
  @ApiProperty({ description: 'Phone number of the applicant', required: true })
  @IsString()
  phone: string;
  @ApiProperty({ description: 'National Identification Number of the applicant', required: true })
  @IsNumberString()
  @Length(11)
  nin: string;
  @ApiProperty({ description: 'Date of birth of the applicant', required: true })
  @IsString()
  dob: Date;
  @ApiProperty()
  @IsString()
  @IsIn(['Male', 'Female'])
  gender: string;
  @ApiPropertyOptional()
  village: string;
  @ApiPropertyOptional()
  lga: string;
  @ApiPropertyOptional()
  state: string;
  @ApiPropertyOptional()
  address: string;
  @ApiPropertyOptional()
  ekpuk: string;

  @ApiPropertyOptional({ description: 'Applicant passport URL', required: false })
  @IsOptional()
  @IsString()
  passport?: string;

  @ApiPropertyOptional({ description: 'Exams type', required: false })
  @IsOptional()
  @IsString()
  examsType?: string;

  @ApiPropertyOptional({ description: 'Application type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Reviewer comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ enum: ApplicationStatusEnum })
  @IsOptional()
  @IsIn([
    ApplicationStatusEnum.InProgress,
    ApplicationStatusEnum.Submitted,
    ApplicationStatusEnum.Reviewed,
    ApplicationStatusEnum.Accepted,
    ApplicationStatusEnum.Rejected,
  ])
  status?: ApplicationStatusEnum;

  // Educational Information

  // Bank Information
}

export class CreateDocumentUploadDTO {
  @ApiProperty()
  @IsInt()
  applicationId: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  schoolIdCard?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificateOfOrigin?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ssceResult?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  birthCertificate?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  admissionLetter?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastSchoolFeeReceipt?: string;
}

export class CreateSchoolRecordDTO {
  @ApiProperty()
  @IsInt()
  applicationId: number;
  @ApiProperty()
  @IsString()
  school: string;
  @ApiPropertyOptional()
  faculty: string;
  @ApiPropertyOptional()
  department: string;
  @ApiPropertyOptional()
  regNo: string;
  @ApiPropertyOptional()
  level: number;
  @ApiPropertyOptional()
  programDuration: number;
  @ApiPropertyOptional()
  nameOfSchool?: string;
  @ApiPropertyOptional()
  subjectGrade?: string;
  @ApiPropertyOptional()
  year?: number;
}

export class CreateBankDetailDTO {
  @ApiProperty()
  @IsInt()
  applicationId: number;
  @ApiProperty()
  @IsString()
  bankName: string;
  @ApiProperty()
  @IsNumberString()
  @Length(10, 10)
  accountNo: string;
  @ApiProperty()
  @IsString()
  accountName: string;
}

export interface OldApplicationDTO {
  _id: ObjectId;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  nin: string;
  status: string;
  type: string;
  applicationSessionId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
