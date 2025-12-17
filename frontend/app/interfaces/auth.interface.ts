export interface LoginDTO {
  email: string;
  password: string;
}

export interface SignupDTO {
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  token: string;
}

export interface ChangePasswordDTO {
  otp: number;
  password: string;
}
