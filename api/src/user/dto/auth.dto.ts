import { ObjectId } from 'mongodb';
import { UserRoleEnum } from '../../generated/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { User } from '../../generated/client';

export class LoginDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  password: string;
}

export class SessionInfo {
  sessionId: string;
  userId: number;
  refresh_token?: string;
  createdAt: Date;
  expiresAt?: Date;
  user?: User;
}

export class OldAuthDto {
  _id: ObjectId;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  otp: number;
}

export interface OldUserDto {
  _id: ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  role: UserRoleEnum;
  office: string;
  createdAt: Date;
  updatedAt: Date;
  image: string;
  otp?: number;
  authId: ObjectId;
  departmentId?: any;
}
