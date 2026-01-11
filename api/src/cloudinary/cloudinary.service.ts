import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { environments } from '../utils/environments';
import * as https from 'https';
import toStream = require('streamifier');

export const cloudinary = v2;

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly agent = new https.Agent({ family: 4, keepAlive: true });

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File buffer is missing');
    }

    this.logger.log(`Starting upload for file: ${file.originalname} (${file.size} bytes)`);

    try {
      // Use buffer -> base64 upload to avoid stream timing issues and leverage IPv4 agent
      const base64Str = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64Str}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'ibeno',
        resource_type: 'auto',
        agent: this.agent,
      });

      this.logger.log(`Cloudinary upload success: ${result.public_id}`);
      return result;
    } catch (error) {
      this.logger.error(`Cloudinary upload failed: ${error.message}`, JSON.stringify(error));
      throw new InternalServerErrorException(error?.message || 'Cloudinary upload failed');
    }
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(new InternalServerErrorException(error.message));
        resolve(result);
      });
    });
  }
}
