import { Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma.service';
import {
  CreateContractorDTO,
  FilterContractorsDTO,
  UpdateContractorDTO,
} from '../dto/contractor.dto';

@Injectable()
export class ContractorService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateContractorNo() {
    const latest = await this.prisma.contractor.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const nextId = (latest?.id || 0) + 1;
    return `CTR-${nextId.toString().padStart(5, '0')}`;
  }

  /**
   * Build seed contractor rows
   */
  private buildSeedData(): Omit<CreateContractorDTO, 'contractorNo'>[] {
    return [
      {
        companyName: 'AkwaTech Engineering Ltd.',
        status: 'ACTIVE',
        registrationCategory: 'Engineering',
        majorArea: 'Infrastructure',
        subArea: 'Roads & Drainage',
        stateOfOrigin: 'Akwa Ibom',
        community: 'Ibeno',
        contactPerson: 'Iniobong Etim',
        phone: '+234-800-100-0001',
        email: 'contact@akwatera.com',
        notes: 'Known for regional civil works.',
      },
      {
        companyName: 'Niger Delta Water Works',
        status: 'ACTIVE',
        registrationCategory: 'Water',
        majorArea: 'Utilities',
        subArea: 'Boreholes',
        stateOfOrigin: 'Rivers',
        contactPerson: 'Amaka Chukwu',
        phone: '+234-800-200-0002',
        email: 'info@ndwaterworks.com',
        notes: 'Owns drilling rigs; experienced in community water schemes.',
      },
      {
        companyName: 'Coastal Build & Supply',
        status: 'ACTIVE',
        registrationCategory: 'Construction',
        majorArea: 'Buildings',
        subArea: 'Educational Facilities',
        stateOfOrigin: 'Akwa Ibom',
        contactPerson: 'Sunday Akpan',
        phone: '+234-800-300-0003',
        email: 'hello@coastalbuild.com',
        notes: 'Focus on classrooms and community halls.',
      },
      {
        companyName: 'HealthReach Services',
        status: 'ACTIVE',
        registrationCategory: 'Healthcare',
        majorArea: 'Health Outreach',
        subArea: 'Mobile Clinics',
        stateOfOrigin: 'Lagos',
        contactPerson: 'Dr. Tolu Odede',
        phone: '+234-800-400-0004',
        email: 'ops@healthreach.ng',
        notes: 'NGO partner for medical missions.',
      },
      {
        companyName: 'BrightGrid Solar',
        status: 'ACTIVE',
        registrationCategory: 'Energy',
        majorArea: 'Solar',
        subArea: 'Mini-grid & Water Pumping',
        stateOfOrigin: 'Abuja',
        contactPerson: 'Grace Yusuf',
        phone: '+234-800-500-0005',
        email: 'projects@brightgrid.energy',
        notes: 'Solar integrator for borehole pumps and mini-grids.',
      },
    ];
  }

  /**
   * Create a new contractor
   */
  async createContractor(input: CreateContractorDTO) {
    try {
      const contractorNo = input.contractorNo?.trim() || (await this.generateContractorNo());
      return this.prisma.contractor.create({
        data: { ...input, contractorNo },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a contractor
   */
  async updateContractor(id: number, input: UpdateContractorDTO) {
    const existing = await this.prisma.contractor.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Contractor with ID ${id} not found`);
    }

    const contractorNo = input.contractorNo?.trim() || existing.contractorNo;
    const { id: _, ...data } = input;

    return this.prisma.contractor.update({
      where: { id },
      data: { ...data, contractorNo },
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
      data: contractors.map((c) => ({
        ...c,
        contractorNo: c.contractorNo?.trim() || '',
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Seed sample contractors (idempotent by companyName)
   */
  async seedContractors() {
    const seeds = this.buildSeedData();
    const results: Array<{
      status: 'created' | 'skipped';
      id: number;
      contractorNo: string;
      companyName: string;
    }> = [];

    for (const seed of seeds) {
      const existing = await this.prisma.contractor.findFirst({
        where: { companyName: seed.companyName },
        select: { id: true, contractorNo: true, companyName: true },
      });

      if (existing) {
        results.push({ status: 'skipped', ...existing });
        continue;
      }

      const created = await this.createContractor(seed);
      results.push({
        status: 'created',
        id: created.id,
        contractorNo: created.contractorNo,
        companyName: created.companyName,
      });
    }

    return {
      count: {
        created: results.filter((r) => r.status === 'created').length,
        skipped: results.filter((r) => r.status === 'skipped').length,
        total: results.length,
      },
      results,
    };
  }

  /**
   * Import contractors from Excel file
   */
  async importFromExcel(file: Express.Multer.File) {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const contractors: CreateContractorDTO[] = data.map((row: any) => ({
        contractorNo: row['Contractor No'] || row['contractorNo'] || '',
        oldRegNo: row['Old Reg No'] || row['oldRegNo'] || '',
        cacRegNo: row['CAC Reg No'] || row['cacRegNo'] || '',
        companyName: row['Company Name'] || row['companyName'] || '',
        status: row['Status'] || row['status'] || 'ACTIVE',
        registrationCategory: row['Registration Category'] || row['registrationCategory'] || '',
        majorArea: row['Major Area'] || row['majorArea'] || '',
        subArea: row['Sub Area'] || row['subArea'] || '',
        stateOfOrigin: row['State of Origin'] || row['stateOfOrigin'] || '',
        community: row['Community'] || row['community'] || '',
        contactPerson: row['Contact Person'] || row['contactPerson'] || '',
        phone: row['Phone'] || row['phone'] || '',
        email: row['Email'] || row['email'] || '',
        notes: row['Notes'] || row['notes'] || '',
        sourceSheet: sheetName,
      }));

      const results = {
        total: contractors.length,
        created: 0,
        updated: 0,
        errors: [] as Array<{ row: number; error: string }>,
      };

      for (let i = 0; i < contractors.length; i++) {
        const contractor = contractors[i];
        try {
          // Check if contractor exists
          const existing = await this.prisma.contractor.findUnique({
            where: { contractorNo: contractor.contractorNo },
          });

          if (existing) {
            // Update existing contractor
            await this.prisma.contractor.update({
              where: { contractorNo: contractor.contractorNo },
              data: contractor,
            });
            results.updated++;
          } else {
            // Create new contractor
            await this.createContractor(contractor);
            results.created++;
          }
        } catch (error) {
          results.errors.push({
            row: i + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get contractor's bid history
   */
  async getContractorBids(contractorNo: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { contractorNo },
      include: {
        bids: {
          include: {
            procurement: {
              select: {
                id: true,
                referenceNo: true,
                title: true,
                category: true,
                status: true,
                submissionDeadline: true,
              },
            },
            events: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!contractor) {
      throw new NotFoundException(`Contractor with number ${contractorNo} not found`);
    }

    return contractor.bids;
  }
}
