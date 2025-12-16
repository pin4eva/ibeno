import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OldAuthDto, OldUserDto } from '../dto/auth.dto';
import { UserRoleEnum } from '../../generated/enums';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // get users
  async getUsers() {
    return this.prisma.user.findMany();
  }

  // import old user data from MongoDB to PostgreSQL
  async importUserAndAuth() {
    try {
      // connect to MongoDB
      const { MongoClient } = await import('mongodb');
      const mongoUrl = process.env.MONGO_URL;
      if (!mongoUrl) {
        throw new BadRequestException('MONGO_URL is not defined in environment variables');
      }
      const mongoClient = new MongoClient(mongoUrl);
      await mongoClient.connect();
      const mongoDb = mongoClient.db(); // use default database from URI

      const usersCollection = mongoDb.collection<OldUserDto>('users');
      const authsCollection = mongoDb.collection<OldAuthDto>('auths');

      const users = await usersCollection.find().toArray();

      for (const user of users) {
        const auth = await authsCollection.findOne({ userId: user._id });

        // create user in PostgreSQL
        const userRecord = await this.prisma.user.create({
          data: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user?.phone,
            image: user?.image,
            role: user?.role || UserRoleEnum.User,
          },
        });

        if (auth?.password) {
          await this.prisma.auth.upsert({
            create: {
              password: auth.password,
              userId: userRecord.id,
            },
            update: {
              password: auth.password,
              userId: userRecord.id,
            },
            where: {
              userId: userRecord.id,
            },
          });
        }
      }

      await mongoClient.close();
      return { message: 'User and Auth data imported successfully' };
    } catch (error) {
      throw error;
    }
  }
}
