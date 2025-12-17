import { ObjectId } from 'mongodb';
import { DepartmentEnum, UserRoleEnum } from '../../generated/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsString } from 'class-validator';
import { User } from '../../generated/client';

export class LoginDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsString()
  password: string;
}

export class SignupDTO {
  // @ApiProperty()
  // @IsEmail()
  // email: string;
  @ApiProperty()
  @IsString()
  password: string;
  @ApiProperty()
  @IsString()
  firstName: string;
  @ApiProperty()
  @IsString()
  lastName: string;
  @ApiProperty()
  @IsString()
  phone: string;
  @ApiProperty()
  @IsString()
  token: string;
}

export class InviteUserDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
  @ApiProperty()
  @IsEnum(DepartmentEnum)
  department: DepartmentEnum;
}

export class ChangePasswordDTO {
  @ApiProperty()
  @IsInt()
  otp: number;

  @ApiProperty()
  @IsString()
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
