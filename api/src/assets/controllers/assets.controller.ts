import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AssetsService } from '../services/assets.service';
import { CreateAssetDTO, FilterAssetsDTO, UpdateAssetDTO } from '../dto/assets.dto';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async getAllAssets(@Query() filter?: FilterAssetsDTO) {
    return this.assetsService.getAllAssets(filter);
  }

  @Get(':id')
  async getAssetById(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.getAssetById(id);
  }

  @Post()
  async createAsset(@Body() data: CreateAssetDTO) {
    return this.assetsService.createAsset(data);
  }

  @Put()
  async updateAsset(@Body() data: UpdateAssetDTO) {
    return this.assetsService.updateAsset(data);
  }

  @Delete(':id')
  async deleteAsset(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.deleteAsset(id);
  }
}
