import ms from 'ms';

export const environments = {
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/ibeno',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:Ifeanyi.123@localhost/ibeno',
  ACCESS_TOKEN_EXPIRY: '15m' as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: '7d' as ms.StringValue,
};
