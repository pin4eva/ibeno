import { ObjectId } from 'mongodb';
import { UserRoleEnum } from 'src/generated/enums';

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
