export interface Contractor {
  id: number;
  contractorNo: string;
  oldRegNo?: string;
  cacRegNo?: string;
  companyName: string;
  status: string;
  registrationCategory?: string;
  majorArea?: string;
  subArea?: string;
  stateOfOrigin?: string;
  community?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
  sourceSheet?: string;
  createdAt: string;
  updatedAt: string;
  bids?: Array<{
    id: number;
    status: string;
    submittedAt?: string;
    procurement?: {
      id: number;
      referenceNo: string;
      title: string;
      status: string;
    };
  }>;
}

export interface CreateContractorInput {
  contractorNo?: string;
  companyName: string;
  status?: string;
  registrationCategory?: string;
  majorArea?: string;
  subArea?: string;
  stateOfOrigin?: string;
  community?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface UpdateContractorInput extends Partial<CreateContractorInput> {
  id: number;
}

export interface FilterContractorsInput {
  search?: string;
  status?: string;
  majorArea?: string;
  stateOfOrigin?: string;
}
