import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContractorDTO {
  @ApiProperty({ description: 'Contractor number (unique)' })
  @IsOptional()
  @IsString()
  contractorNo?: string;

  @ApiPropertyOptional({ description: 'Old registration number' })
  @IsOptional()
  @IsString()
  oldRegNo?: string;

  @ApiPropertyOptional({ description: 'CAC registration number' })
  @IsOptional()
  @IsString()
  cacRegNo?: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  companyName: string;

  @ApiPropertyOptional({ description: 'Status (ACTIVE, INACTIVE, etc.)', default: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Registration category' })
  @IsOptional()
  @IsString()
  registrationCategory?: string;

  @ApiPropertyOptional({ description: 'Major area of operation' })
  @IsOptional()
  @IsString()
  majorArea?: string;

  @ApiPropertyOptional({ description: 'Sub-area of operation' })
  @IsOptional()
  @IsString()
  subArea?: string;

  @ApiPropertyOptional({ description: 'State of origin' })
  @IsOptional()
  @IsString()
  stateOfOrigin?: string;

  @ApiPropertyOptional({ description: 'Community' })
  @IsOptional()
  @IsString()
  community?: string;

  @ApiPropertyOptional({ description: 'Contact person name' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Source sheet name' })
  @IsOptional()
  @IsString()
  sourceSheet?: string;
}

export class UpdateContractorDTO extends PartialType(CreateContractorDTO) {
  @ApiProperty({ description: 'Contractor ID' })
  @Type(() => Number)
  @IsNumber()
  id: number;
}

export class FilterContractorsDTO {
  @ApiPropertyOptional({ description: 'Search by contractor number or company name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by major area' })
  @IsOptional()
  @IsString()
  majorArea?: string;

  @ApiPropertyOptional({ description: 'Filter by state of origin' })
  @IsOptional()
  @IsString()
  stateOfOrigin?: string;
}
