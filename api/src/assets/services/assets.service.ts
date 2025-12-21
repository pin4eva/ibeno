import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateAssetDTO, FilterAssetsDTO, UpdateAssetDTO } from '../dto/assets.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a unique asset number
   * Format: AST-YYYYMMDD-XXXX (e.g., AST-20250101-0001)
   */
  private async generateAssetNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Find the latest asset number for today
    const prefix = `AST-${dateStr}`;
    const latestAsset = await this.prisma.asset.findFirst({
      where: {
        assetNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        assetNumber: 'desc',
      },
    });

    let sequence = 1;
    if (latestAsset) {
      const lastSequence = parseInt(latestAsset.assetNumber.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  async getAllAssets(filter?: FilterAssetsDTO) {
    const where: any = {};

    if (filter?.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { assetNumber: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter?.location) {
      where.location = { contains: filter.location, mode: 'insensitive' };
    }

    return this.prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssetById(id: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async createAsset(data: CreateAssetDTO) {
    // Generate asset number if not provided
    const assetNumber = data.assetNumber || (await this.generateAssetNumber());

    return this.prisma.asset.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        assetNumber,
        imageUrl: data.imageUrl,
      },
    });
  }

  async updateAsset(data: UpdateAssetDTO) {
    // Check if asset exists
    await this.getAssetById(data.id);

    return this.prisma.asset.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        assetNumber: data.assetNumber,
        imageUrl: data.imageUrl,
      },
    });
  }

  async deleteAsset(id: number) {
    // Check if asset exists
    await this.getAssetById(id);

    return this.prisma.asset.delete({
      where: { id },
    });
  }
}
