import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '../../generated/client';
import { OldAuthDto, OldUserDto } from '../dto/auth.dto';
import { UserRoleEnum, UserStatusEnum } from '../../generated/enums';
import { ChangeProfilePasswordDTO, UpdateProfileDTO, UpdateUserDTO, UserFilterDTO } from '../dto/user.dto';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // get users with pagination and filtering
  async getUsers(filter: UserFilterDTO) {
    const { page = 1, limit = 10, search, role, status, department } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;
    if (department) where.department = department;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // find one user
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { auth: { select: { status: true, lastLogin: true } } },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  // update user
  async update(id: number, data: UpdateUserDTO) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // remove user (soft delete)
  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status: UserStatusEnum.Suspended },
    });
  }

  // update current user profile
  async updateProfile(userId: number, data: UpdateProfileDTO) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  // change password for current user
  async changeProfilePassword(userId: number, data: ChangeProfilePasswordDTO) {
    const authRecord = await this.prisma.auth.findUnique({
      where: { userId },
    });

    if (!authRecord) {
      throw new BadRequestException('Authentication record not found');
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(data.oldPassword, authRecord.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await this.prisma.auth.update({
      where: { id: authRecord.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  // import old user data from MongoDB to PostgreSQL
  async importUserAndAuth() {
    console.log('importing users...');
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new BadRequestException('MONGO_URL is not defined in environment variables');
    }
    const mongoClient = new MongoClient(mongoUrl);
    try {
      // connect to MongoDB

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
    } finally {
      await mongoClient.close();
    }
  }
}
