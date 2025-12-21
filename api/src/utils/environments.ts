import ms from 'ms';
import { config } from 'dotenv';

config();

export const environments = {
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/ibeno',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:Ifeanyi.123@localhost/ibeno',
  ACCESS_TOKEN_EXPIRY: '15m' as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: '7d' as ms.StringValue,
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  MAIL_SENDER: {
    email: 'info@ihcdt.org',
    name: 'IHCDT',
  },
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};
