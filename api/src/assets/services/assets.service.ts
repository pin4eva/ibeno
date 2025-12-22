import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateAssetDTO, UpdateAssetDTO, FilterAssetsDTO } from '../dto/asset.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { Prisma } from 'src/generated/client';

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
    const assetNumber = data?.assetNumber || (await this.generateAssetNumber());

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
    const where: Prisma.AssetWhereInput = {};

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
   * Extract Cloudinary public_id from URL
   */
  private extractPublicId(url: string): string | null {
    try {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
      const urlParts = url.split('/');
      const uploadIndex = urlParts.indexOf('upload');

      if (uploadIndex === -1) {
        return null;
      }

      // Get everything after 'upload', excluding the last segment (filename with extension)
      const pathAfterUpload = urlParts.slice(uploadIndex + 1);

      // Remove the last segment (filename)
      const publicIdWithExt = pathAfterUpload[pathAfterUpload.length - 1];

      // Remove file extension
      const publicId = publicIdWithExt.split('.')[0];

      // If there are folder paths, include them
      if (pathAfterUpload.length > 1) {
        const folders = pathAfterUpload.slice(0, -1).filter((p) => !p.match(/^[a-z]_/)); // Exclude transformations
        return folders.length > 0 ? `${folders.join('/')}/${publicId}` : publicId;
      }

      return publicId;
    } catch (error) {
      console.error('Failed to extract public_id from URL:', url, error);
      return null;
    }
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
          const publicId = this.extractPublicId(oldAsset.imageUrl);
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
        const publicId = this.extractPublicId(asset.imageUrl);
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
