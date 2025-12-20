import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === 'string'
                ? error
                : 'Unknown upload error';
          return reject(new Error(errorMessage));
        }
        if (!result) {
          return reject(new Error('Upload failed: No result returned'));
        }
        resolve(result);
      });
      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}
