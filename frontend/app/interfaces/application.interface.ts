export enum ApplicationStatusEnum {
  InProgress = 'In Progress',
  Submitted = 'Submitted',
  Reviewed = 'Reviewed',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}

export enum GenderEnum {
  Male = 'Male',
  Female = 'Female',
}

export const genderOptions = [
  { label: 'Male', value: GenderEnum.Male },
  { label: 'Female', value: GenderEnum.Female },
];

export interface Application {
  id?: number;
  programId: number;
  applicationNo?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  nin: string;
  dob: string;
  gender: GenderEnum | string;
  village?: string;
  lga?: string;
  state?: string;
  address?: string;
  ekpuk?: string;
  country?: string;
  school?: string;
  faculty?: string;
  department?: string;
  regNo?: string;
  level?: number;
  programDuration?: number;
  admissionLeterUrl?: string;
  lastSchoolFeeReceiptUrl?: string;
  certificateOfOriginUrl?: string;
  ssceResultUrl?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  passport?: string;
  status?: ApplicationStatusEnum;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicantLogin {
  applicationNo: string;
  nin: string;
}
