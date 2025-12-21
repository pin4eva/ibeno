import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateAssetDTO, UpdateAssetDTO, FilterAssetsDTO } from '../dto/asset.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Generate a unique asset number
   */
  private async generateAssetNumber(): Promise<string> {
    const prefix = 'AST';
    const year = new Date().getFullYear();

    // Get the count of assets created this year
    const count = await this.prisma.asset.count({
      where: {
        assetNumber: {
          startsWith: `${prefix}-${year}`,
        },
      },
    });

    // Generate new number with leading zeros (e.g., AST-2025-0001)
    const number = (count + 1).toString().padStart(4, '0');
    return `${prefix}-${year}-${number}`;
  }

  /**
   * Create a new asset
   */
  async create(data: CreateAssetDTO) {
    // Generate asset number if not provided
    const assetNumber = data.assetNumber || (await this.generateAssetNumber());

    return this.prisma.asset.create({
      data: {
        ...data,
        assetNumber,
      },
    });
  }

  /**
   * Get all assets with optional filters
   */
  async findAll(filter?: FilterAssetsDTO) {
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

    if (filter?.assetType) {
      where.assetType = { contains: filter.assetType, mode: 'insensitive' };
    }

    return this.prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single asset by ID
   */
  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  /**
   * Update an asset
   */
  async update(id: number, data: Partial<UpdateAssetDTO>) {
    // Check if asset exists
    await this.findOne(id);

    // If imageUrl is being updated and old image exists, delete it from cloudinary
    if (data.imageUrl) {
      const oldAsset = await this.prisma.asset.findUnique({ where: { id } });
      if (oldAsset?.imageUrl) {
        try {
          // Extract public_id from the cloudinary URL and delete
          const publicId = oldAsset.imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
          }
        } catch (error) {
          console.error('Failed to delete old image:', error);
        }
      }
    }

    return this.prisma.asset.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete an asset
   */
  async delete(id: number) {
    const asset = await this.findOne(id);

    // Delete image from cloudinary if exists
    if (asset.imageUrl) {
      try {
        const publicId = asset.imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }

    await this.prisma.asset.delete({
      where: { id },
    });

    return { message: 'Asset deleted successfully' };
  }

  /**
   * Get unique locations for filtering
   */
  async getLocations() {
    const assets = await this.prisma.asset.findMany({
      select: { location: true },
      distinct: ['location'],
    });
    return assets.map((a) => a.location).filter(Boolean);
  }

  /**
   * Get unique asset types for filtering
   */
  async getAssetTypes() {
    const assets = await this.prisma.asset.findMany({
      select: { assetType: true },
      distinct: ['assetType'],
    });
    return assets.map((a) => a.assetType).filter(Boolean);
  }
}
