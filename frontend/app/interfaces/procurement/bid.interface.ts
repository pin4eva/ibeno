export enum BidStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  AWARDED = 'awarded',
}

export interface BidEvent {
  id: number;
  bidId: number;
  action: string;
  actorId?: number;
  actorRole?: string;
  metadata?: string;
  createdAt: string;
}

export interface Bid {
  id: number;
  procurementId: number;
  contractorId: number;
  contractorNo: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  price?: number;
  technicalProposalUrl?: string;
  commercialProposalUrl?: string;
  otherFiles: string[];
  notes?: string;
  status: BidStatus;
  submittedAt: string;
  updatedAt: string;
  contractor?: {
    id: number;
    contractorNo: string;
    companyName: string;
    status: string;
  };
  events?: BidEvent[];
}

export interface CreateBidInput {
  contractorNo: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  price?: number;
  technicalProposalUrl?: string;
  commercialProposalUrl?: string;
  otherFiles?: string[];
  notes?: string;
}

export interface UpdateBidInput extends Partial<CreateBidInput> {
  id: number;
  status?: BidStatus;
}

export interface FilterBidsInput {
  search?: string;
  status?: BidStatus;
  contractorNo?: string;
}

export interface ChangeBidStatusInput {
  status: BidStatus;
  actorId?: number;
  actorRole?: string;
  metadata?: string;
}
