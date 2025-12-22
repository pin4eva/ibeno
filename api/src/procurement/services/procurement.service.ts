import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateProcurementDTO,
  UpdateProcurementDTO,
  FilterProcurementsDTO,
  UploadProcurementDocumentDTO,
  ProcurementStatusEnum,
} from '../dto/procurement.dto';

@Injectable()
export class ProcurementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a unique reference number for procurement
   */
  private async generateReferenceNo(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

    // Find the highest number for today
    const lastProcurement = await this.prisma.procurement.findFirst({
      where: {
        referenceNo: {
          startsWith: `PROC-${dateStr}`,
        },
      },
      orderBy: {
        referenceNo: 'desc',
      },
    });

    let sequence = 1;
    if (lastProcurement) {
      const lastSeq = parseInt(lastProcurement.referenceNo.split('-')[2], 10);
      sequence = lastSeq + 1;
    }

    return `PROC-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Create a new procurement
   */
  async createProcurement(input: CreateProcurementDTO) {
    // Validate submission deadline is in the future
    const deadline = new Date(input.submissionDeadline);
    if (deadline <= new Date()) {
      throw new BadRequestException('Submission deadline must be in the future');
    }

    // Validate publishDate <= submissionDeadline
    const publishDate = input.publishDate ? new Date(input.publishDate) : new Date();
    if (publishDate > deadline) {
      throw new BadRequestException('Publish date must be before or equal to submission deadline');
    }

    // Generate reference number if not provided
    const referenceNo = input.referenceNo || (await this.generateReferenceNo());

    return this.prisma.procurement.create({
      data: {
        ...input,
        referenceNo,
        publishDate: publishDate.toISOString(),
      },
      include: {
        documents: true,
        bids: true,
      },
    });
  }

  /**
   * Get all procurements with filters
   */
  async getAllProcurements(filter?: FilterProcurementsDTO) {
    const where: Record<string, unknown> = {};

    if (filter?.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { referenceNo: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.location) {
      where.location = filter.location;
    }

    if (filter?.category) {
      where.category = filter.category;
    }

    if (filter?.type) {
      where.type = filter.type;
    }

    if (filter?.createdBy) {
      where.createdBy = filter.createdBy;
    }

    if (filter?.deadlineFrom || filter?.deadlineTo) {
      const deadlineFilter: { gte?: Date; lte?: Date } = {};
      if (filter.deadlineFrom) {
        deadlineFilter.gte = new Date(filter.deadlineFrom);
      }
      if (filter.deadlineTo) {
        deadlineFilter.lte = new Date(filter.deadlineTo);
      }
      where.submissionDeadline = deadlineFilter;
    }

    const procurements = await this.prisma.procurement.findMany({
      where,
      include: {
        documents: true,
        _count: {
          select: { bids: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return procurements;
  }

  /**
   * Get procurement by ID
   */
  async getProcurementById(id: number) {
    const procurement = await this.prisma.procurement.findUnique({
      where: { id },
      include: {
        documents: true,
        bids: {
          include: {
            contractor: true,
          },
        },
      },
    });

    if (!procurement) {
      throw new NotFoundException(`Procurement with ID ${id} not found`);
    }

    return procurement;
  }

  /**
   * Update procurement
   */
  async updateProcurement(input: UpdateProcurementDTO) {
    const existing = await this.prisma.procurement.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new NotFoundException(`Procurement with ID ${input.id} not found`);
    }

    // Cannot move back from archived
    if (existing.status === ProcurementStatusEnum.archived) {
      throw new BadRequestException('Cannot update archived procurement');
    }

    // Validate dates if provided
    if (input.submissionDeadline) {
      const deadline = new Date(input.submissionDeadline);
      const publishDate = input.publishDate
        ? new Date(input.publishDate)
        : new Date(existing.publishDate);

      if (publishDate > deadline) {
        throw new BadRequestException('Publish date must be before or equal to submission deadline');
      }
    }

    return this.prisma.procurement.update({
      where: { id: input.id },
      data: input,
      include: {
        documents: true,
        bids: true,
      },
    });
  }

  /**
   * Delete procurement (only drafts or archive published ones)
   */
  async deleteProcurement(id: number) {
    const procurement = await this.prisma.procurement.findUnique({
      where: { id },
    });

    if (!procurement) {
      throw new NotFoundException(`Procurement with ID ${id} not found`);
    }

    if (procurement.status === ProcurementStatusEnum.draft) {
      // Delete draft
      return this.prisma.procurement.delete({
        where: { id },
      });
    } else {
      // Archive published ones
      return this.prisma.procurement.update({
        where: { id },
        data: { status: ProcurementStatusEnum.archived },
      });
    }
  }

  /**
   * Upload procurement document
   */
  async uploadDocument(procurementId: number, input: UploadProcurementDocumentDTO) {
    const procurement = await this.prisma.procurement.findUnique({
      where: { id: procurementId },
    });

    if (!procurement) {
      throw new NotFoundException(`Procurement with ID ${procurementId} not found`);
    }

    return this.prisma.procurementDocument.create({
      data: {
        ...input,
        procurementId,
      },
    });
  }

  /**
   * Get procurement documents
   */
  async getDocuments(procurementId: number) {
    return this.prisma.procurementDocument.findMany({
      where: { procurementId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete procurement document
   */
  async deleteDocument(documentId: number) {
    const document = await this.prisma.procurementDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    return this.prisma.procurementDocument.delete({
      where: { id: documentId },
    });
  }
}
