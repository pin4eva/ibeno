import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export enum ProgramCategoryEnum {
  Education = 'Education',
  Medical = 'Medical Mission',
  Community = 'Community Service',
}
export class CreateProgramDTO {
  @ApiProperty({ description: 'Name of the program' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the program' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of the program', enum: ProgramCategoryEnum })
  @IsEnum(ProgramCategoryEnum)
  category: ProgramCategoryEnum;

  @ApiPropertyOptional({ description: 'Indicates if the program is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Sub-category of the program',
    required: false,
    example: 'Scholarship, Free Jamb',
  })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiPropertyOptional({ description: 'Start date of the program', required: false })
  @IsString()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date of the program', required: false })
  @IsString()
  endDate?: Date;
}

export class FilterProgramsDTO {
  @ApiPropertyOptional({ enum: ProgramCategoryEnum })
  @IsOptional()
  @IsEnum(ProgramCategoryEnum)
  category?: ProgramCategoryEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}

export class UpdateProgramDTO extends PartialType(CreateProgramDTO) {
  @ApiProperty()
  @IsInt()
  id: number;
}

export interface OldProgramDTO {
  _id: ObjectId;
  name: string;
  year: number;
  isActive: boolean;
  createdAt: Date;
  description: string;
  endDate: Date;
  image: string;
  startDate: Date;
  type: string;
}
