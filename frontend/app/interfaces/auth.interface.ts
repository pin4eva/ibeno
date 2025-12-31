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

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  passwordUpdateRequired?: boolean;
  otp?: number;
  user: {
    id: number;
    role: string;
    firstName: string;
    lastName: string;
  };
}
