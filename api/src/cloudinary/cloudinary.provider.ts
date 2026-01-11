import { v2 as cloudinary } from 'cloudinary';
import { environments } from '../utils/environments';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = environments;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error(
        'Missing Cloudinary env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET',
      );
    }

    // Log configuration (masking secrets) for debugging
    console.log(
      `Cloudinary Config: Cloud Name=${CLOUDINARY_CLOUD_NAME}, Key=${CLOUDINARY_API_KEY?.substring(0, 4)}***`,
    );

    return cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  },
};
