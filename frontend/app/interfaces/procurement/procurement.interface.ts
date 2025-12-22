import type { Bid } from './bid.interface';

export enum ProcurementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  AWARDED = 'awarded',
  ARCHIVED = 'archived',
}

export interface ProcurementDocument {
  id: number;
  procurementId: number;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
}

export interface Procurement {
  id: number;
  referenceNo: string;
  title: string;
  category: string;
  type: string;
  location: string;
  description: string;
  eligibilityCriteria?: string;
  submissionDeadline: string;
  publishDate: string;
  status: ProcurementStatus;
  budgetEstimate?: number;
  preBidMeetingDate?: string;
  preBidMeetingLocation?: string;
  preBidNotes?: string;
  tags: string[];
  contactEmail?: string;
  contactPhone?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  documents?: ProcurementDocument[];
  bids?: Bid[];
  _count?: {
    bids: number;
  };
}

export interface CreateProcurementInput {
  title: string;
  referenceNo?: string;
  category: string;
  type: string;
  location: string;
  description: string;
  eligibilityCriteria?: string;
  submissionDeadline: string;
  publishDate?: string;
  budgetEstimate?: number;
  preBidMeetingDate?: string;
  preBidMeetingLocation?: string;
  preBidNotes?: string;
  tags?: string[];
  contactEmail?: string;
  contactPhone?: string;
  createdBy: number;
}

export interface UpdateProcurementInput extends Partial<CreateProcurementInput> {
  id: number;
  status?: ProcurementStatus;
}

export interface FilterProcurementsInput {
  search?: string;
  status?: ProcurementStatus;
  location?: string;
  category?: string;
  type?: string;
  createdBy?: number;
  deadlineFrom?: string;
  deadlineTo?: string;
}

export interface UploadDocumentInput {
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
}
