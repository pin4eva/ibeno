export enum ProgramCategoryEnum {
  Education = 'Education',
  Medical = 'Medical Mission',
  Community = 'Community Service',
}
export interface CreateProgramDTO {
  name: string;
  description: string;
  category: ProgramCategoryEnum;
  isActive?: boolean;
  subCategory?: string;
  /** ISO string from API */
  startDate?: string | null;
  /** ISO string from API */
  endDate?: string | null;
}

export interface Program extends CreateProgramDTO {
  id: number;
  bannerImage?: string | null;
  /** ISO string from API */
  createdAt?: string;
  /** ISO string from API */
  updatedAt?: string;
}

export interface UpdateProgramDTO extends Partial<CreateProgramDTO> {
  id: number;
}
