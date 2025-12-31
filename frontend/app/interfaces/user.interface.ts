export enum UserRoleEnum {
  User = 'User',
  Admin = 'Admin',
  Editor = 'Editor',
  Developer = 'Developer',
  Contractor = 'Contractor',
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRoleEnum;
  department: string;
  status: string;
  createdAt: string;
}
