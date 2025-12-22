import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum ProcurementStatusEnum {
  draft = 'draft',
  published = 'published',
  closed = 'closed',
  awarded = 'awarded',
  archived = 'archived',
}

export class CreateProcurementDTO {
  @ApiProperty({ description: 'Title of the procurement' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Reference number (auto-generated if blank)' })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiProperty({ description: 'Category of the procurement' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Type of the procurement' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Location of the procurement' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Description/scope of the procurement' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Eligibility criteria' })
  @IsOptional()
  @IsString()
  eligibilityCriteria?: string;

  @ApiProperty({ description: 'Submission deadline (ISO 8601)' })
  @IsDateString()
  submissionDeadline: string;

  @ApiPropertyOptional({ description: 'Publish date (ISO 8601, defaults to now)' })
  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @ApiPropertyOptional({ description: 'Budget estimate', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetEstimate?: number;

  @ApiPropertyOptional({ description: 'Pre-bid meeting date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  preBidMeetingDate?: string;

  @ApiPropertyOptional({ description: 'Pre-bid meeting location' })
  @IsOptional()
  @IsString()
  preBidMeetingLocation?: string;

  @ApiPropertyOptional({ description: 'Pre-bid meeting notes' })
  @IsOptional()
  @IsString()
  preBidNotes?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ description: 'ID of the user creating the procurement' })
  @IsInt()
  createdBy: number;
}

export class UpdateProcurementDTO extends PartialType(CreateProcurementDTO) {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiPropertyOptional({ enum: ProcurementStatusEnum })
  @IsOptional()
  @IsEnum(ProcurementStatusEnum)
  status?: ProcurementStatusEnum;
}

export class FilterProcurementsDTO {
  @ApiPropertyOptional({ description: 'Search by title or reference number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ProcurementStatusEnum })
  @IsOptional()
  @IsEnum(ProcurementStatusEnum)
  status?: ProcurementStatusEnum;

  @ApiPropertyOptional({ description: 'Filter by location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by type' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by created by user ID (admin only)' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  createdBy?: number;

  @ApiPropertyOptional({ description: 'Filter by deadline from (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  deadlineFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by deadline to (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  deadlineTo?: string;
}

export class UploadProcurementDocumentDTO {
  @ApiProperty({ description: 'Document name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Document URL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'MIME type' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsInt()
  size?: number;
}
