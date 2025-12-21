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

export interface BankDetail {
  applicationId: number;
  accountNo: string;
  accountName: string;
  bankName: string;
}

export interface DocumentUpload {
  applicationId: number;
  schoolIdCard?: string;
  certificateOfOrigin?: string;
  ssceResult?: string;
  birthCertificate?: string;
  admissionLetter?: string;
  lastSchoolFeeReceipt?: string;
}

export interface SchoolRecord {
  applicationId: number;
  regNo?: string;
  level?: number;
  programDuration?: number;
  school?: string;
  faculty?: string;
  department?: string;
  nameOfSchool?: string;
  subjectGrade?: string;
  year?: number;
}

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
  examsType?: string;
  type?: string;
  comment?: string;

  // Related objects
  bankDetails?: BankDetail;
  documentUpload?: DocumentUpload;
  schoolRecord?: SchoolRecord;

  passport?: string;
  status?: ApplicationStatusEnum;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicantLogin {
  applicationNo: string;
  nin: string;
}
