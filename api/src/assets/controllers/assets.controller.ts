import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../decorators/roles.decorator';
import { UserRoleEnum } from '../../generated/enums';
import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CreateAssetDTO, FilterAssetsDTO, UpdateAssetDTO } from '../dto/asset.dto';
import { AssetsService } from '../services/assets.service';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
@UseGuards(AuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor)
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  async create(@Body() data: CreateAssetDTO) {
    return this.assetsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets with optional filters' })
  @ApiResponse({ status: 200, description: 'List of assets' })
  async findAll(@Query() filter: FilterAssetsDTO) {
    return this.assetsService.findAll(filter);
  }

  @Get('locations')
  @ApiOperation({ summary: 'Get unique locations' })
  @ApiResponse({ status: 200, description: 'List of unique locations' })
  async getLocations() {
    return this.assetsService.getLocations();
  }

  @Get('types')
  @ApiOperation({ summary: 'Get unique asset types' })
  @ApiResponse({ status: 200, description: 'List of unique asset types' })
  async getAssetTypes() {
    return this.assetsService.getAssetTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset details' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor)
  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateAssetDTO) {
    return this.assetsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin)
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.delete(id);
  }
}
