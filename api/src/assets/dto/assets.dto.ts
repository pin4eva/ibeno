import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAssetDTO {
  @ApiProperty({ description: 'Name of the asset' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the asset' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Location of the asset' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ description: 'Asset number (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  assetNumber?: string;

  @ApiPropertyOptional({ description: 'URL of the asset image' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateAssetDTO extends PartialType(CreateAssetDTO) {
  @ApiProperty({ description: 'Asset ID' })
  @IsInt()
  id: number;
}

export class FilterAssetsDTO {
  @ApiPropertyOptional({ description: 'Search by asset name or number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by location' })
  @IsOptional()
  @IsString()
  location?: string;
}
