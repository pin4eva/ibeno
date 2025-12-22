import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateContractorDTO, FilterContractorsDTO } from '../dto/contractor.dto';

@Injectable()
export class ContractorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new contractor
   */
  async createContractor(input: CreateContractorDTO) {
    return this.prisma.contractor.create({
      data: input,
    });
  }

  /**
   * Get all contractors with filters
   */
  async getAllContractors(filter?: FilterContractorsDTO) {
    const where: Record<string, unknown> = {};

    if (filter?.search) {
      where.OR = [
        { contractorNo: { contains: filter.search, mode: 'insensitive' } },
        { companyName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.majorArea) {
      where.majorArea = filter.majorArea;
    }

    if (filter?.stateOfOrigin) {
      where.stateOfOrigin = filter.stateOfOrigin;
    }

    return this.prisma.contractor.findMany({
      where,
      orderBy: {
        companyName: 'asc',
      },
    });
  }

  /**
   * Get contractor by contractor number
   */
  async getContractorByNo(contractorNo: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { contractorNo },
      include: {
        bids: {
          include: {
            procurement: true,
          },
        },
      },
    });

    if (!contractor) {
      throw new NotFoundException(`Contractor with number ${contractorNo} not found`);
    }

    return contractor;
  }

  /**
   * Get contractor by ID
   */
  async getContractorById(id: number) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id },
      include: {
        bids: {
          include: {
            procurement: true,
          },
        },
      },
    });

    if (!contractor) {
      throw new NotFoundException(`Contractor with ID ${id} not found`);
    }

    return contractor;
  }

  /**
   * Bulk create contractors (for import)
   */
  async bulkCreateContractors(contractors: CreateContractorDTO[]) {
    return this.prisma.contractor.createMany({
      data: contractors,
      skipDuplicates: true,
    });
  }
}
