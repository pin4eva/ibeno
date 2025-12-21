import { v2 as cloudinary } from 'cloudinary';
import { environments } from '../utils/environments';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: environments.CLOUDINARY_CLOUD_NAME,
      api_key: environments.CLOUDINARY_API_KEY,
      api_secret: environments.CLOUDINARY_API_SECRET,
    });
  },
};
