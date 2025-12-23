import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum BidStatusEnum {
  submitted = 'submitted',
  under_review = 'under_review',
  accepted = 'accepted',
  rejected = 'rejected',
  withdrawn = 'withdrawn',
  awarded = 'awarded',
}

export class CreateBidDTO {
  @ApiProperty({ description: 'Contractor number' })
  @IsString()
  contractorNo: string;

  @ApiProperty({ description: 'Contact person name' })
  @IsString()
  contactName: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  contactEmail: string;

  @ApiProperty({ description: 'Contact phone number' })
  @IsString()
  contactPhone: string;

  @ApiPropertyOptional({ description: 'Bid amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Proposal file URL' })
  @IsOptional()
  @IsString()
  proposalUrl?: string;

  @ApiPropertyOptional({ description: 'Bid price (legacy)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Technical proposal URL (legacy)' })
  @IsOptional()
  @IsString()
  technicalProposalUrl?: string;

  @ApiPropertyOptional({ description: 'Commercial proposal URL (legacy)' })
  @IsOptional()
  @IsString()
  commercialProposalUrl?: string;

  @ApiPropertyOptional({ description: 'Other file URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  otherFiles?: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBidDTO extends PartialType(CreateBidDTO) {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiPropertyOptional({ description: 'Bid status', enum: BidStatusEnum })
  @IsOptional()
  @IsEnum(BidStatusEnum)
  status?: BidStatusEnum;
}

export class FilterBidsDTO {
  @ApiPropertyOptional({ description: 'Search by contractor number or company name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BidStatusEnum })
  @IsOptional()
  @IsEnum(BidStatusEnum)
  status?: BidStatusEnum;

  @ApiPropertyOptional({ description: 'Filter by contractor number' })
  @IsOptional()
  @IsString()
  contractorNo?: string;
}

export class ChangeBidStatusDTO {
  @ApiProperty({ description: 'New bid status', enum: BidStatusEnum })
  @IsEnum(BidStatusEnum)
  status: BidStatusEnum;

  @ApiPropertyOptional({ description: 'Actor ID (admin user)' })
  @IsOptional()
  @IsInt()
  actorId?: number;

  @ApiPropertyOptional({ description: 'Actor role' })
  @IsOptional()
  @IsString()
  actorRole?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON string)' })
  @IsOptional()
  @IsString()
  metadata?: string;
}
