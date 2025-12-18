import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ApplicationDTO, FilterApplicationsDTO, OldApplicationDTO } from '../dto/application.dto';
import { OldProgramDTO } from '../dto/programs.dto';
import { Application, Prisma } from 'src/generated/client';

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async createApplication(input: ApplicationDTO) {
    const { id, programId, ...data } = input;
    try {
      const email = input?.email?.toLowerCase()?.trim();
      const program = await this.prisma.program.findUnique({
        where: { id: programId },
      });
      if (!program) {
        throw new NotFoundException('Program not found');
      }

      if (id) {
        // update existing application
        const updatedApplication = await this.prisma.application.update({
          where: { id },
          data: {
            ...data,
            email,
          },
        });
        return updatedApplication;
      }

      const existingApplication = await this.prisma.application.findFirst({
        where: { OR: [{ email }, { nin: data.nin }], programId },
      });
      if (existingApplication) {
        throw new BadRequestException('You already have an application for this program');
      }

      // appliction number should be in this format: APP-{programId}-{year}-{serialNo}
      const applicationNo = await this.generateApplicationNo(programId);
      const application = await this.prisma.application.create({
        data: {
          ...data,
          programId,
          email,
          applicationNo: applicationNo,
        },
      });
      return application;
    } catch (error) {
      throw error;
    }
  }

  async getApplicationById(id: number) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async getAllApplications(query?: FilterApplicationsDTO) {
    const where: Prisma.ApplicationWhereInput = {};
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.programId) {
      where.programId = query.programId;
    }
    if (query?.category) {
      where.program = {
        category: query.category,
      };
    }
    const applications = await this.prisma.application.findMany({
      where,
    });
    return applications;
  }
  async getApplicationsByProgram(programId: number) {
    const applications = await this.prisma.application.findMany({
      where: { programId },
    });
    return applications;
  }

  async getApplicationsByProgramCategory(category: string) {
    const applications = await this.prisma.application.findMany({
      where: {
        program: {
          category,
        },
      },
    });
    return applications;
  }

  async importApplications() {
    // import application from the old database

    try {
      // connect to MongoDB
      const { MongoClient } = await import('mongodb');
      const mongoUrl = process.env.MONGO_URL;
      if (!mongoUrl) {
        throw new BadRequestException('MONGO_URL is not defined in environment variables');
      }
      const mongoClient = new MongoClient(mongoUrl);
      await mongoClient.connect();
      const mongoDb = mongoClient.db(); // use default database from URI

      const applicationCollection = mongoDb.collection<OldApplicationDTO>('students');

      const applications = await applicationCollection.find().toArray();
      const emails = new Set<string>();
      const nins = new Set<string>();
      const applicationsInDB: Application[] = [];

      for (const application of applications) {
        const email = application?.email?.toLowerCase()?.trim();
        if (emails.has(email)) {
          continue;
        }
        let nin: string = '';
        if (application?.nin) {
          nin = application.nin.replaceAll('-', '').replaceAll(' ', '').trim();

          if (nins.has(nin)) {
            continue;
          }
        }
        const programId = application?.type == 'Free Jamb' ? 1 : 2;
        const applicationNo = await this.generateApplicationNo(programId);

        const applicationData = await this.prisma.application.create({
          data: {
            nin,
            programId,
            applicationNo,
            firstName: application.firstName,
            lastName: application.lastName,
            middleName: application.middleName,
            email: email,
            phone: application.phone,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
          },
        });
        applicationsInDB.push(applicationData);
        emails.add(email);
        nins.add(nin);
      }

      await mongoClient.close();
      return { message: 'User and Auth data imported successfully', applicationsInDB };
    } catch (error) {
      throw error;
    }
  }

  private async generateApplicationNo(programId: number): Promise<string> {
    let applicationNo = `APP-${programId}-${new Date().getFullYear()}-`;
    const documentCount = await this.prisma.application.count({
      where: { programId },
    });
    const serialNo = documentCount + 1;
    applicationNo += serialNo.toString().padStart(4, '0');
    return applicationNo;
  }
}
