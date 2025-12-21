import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  ApplicantLoginDTO,
  ApplicationDTO,
  ApplicationStatusEnum,
  CreateBankDetailDTO,
  CreateDocumentUploadDTO,
  CreateSchoolRecordDTO,
  FilterApplicationsDTO,
  OldApplicationDTO,
} from '../dto/application.dto';
import { OldProgramDTO } from '../dto/programs.dto';
import { Application, Prisma } from 'src/generated/client';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createApplication(input: ApplicationDTO) {
    const { id, programId, status, type, comment, passport, examsType, ...data } = input;
    const nin = data.nin?.replaceAll('-', '').replaceAll(' ', '').trim();
    if (!nin) throw new BadRequestException('NIN is required');
    try {
      const email = input?.email?.toLowerCase()?.trim();
      const program = await this.prisma.program.findUnique({
        where: { id: programId },
      });
      if (!program) {
        throw new NotFoundException('Program not found');
      }

      const dob = data?.dob ? new Date(data.dob) : undefined;

      const applicationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        email,
        phone: data.phone,
        nin,
        dob,
        gender: data.gender,
        village: data.village,
        lga: data.lga,
        state: data.state,
        address: data.address,
        ekpuk: data.ekpuk,
        passport,
        examsType,
        type,
        comment,
        status,
      } as Prisma.ApplicationUncheckedCreateInput;

      if (id) {
        // update existing application

        const updatedApplication = await this.prisma.application.update({
          where: { id },
          data: applicationData,
        });
        return updatedApplication;
      }

      const existingApplication = await this.prisma.application.findFirst({
        where: { OR: [{ email }, { nin }], programId },
      });
      if (existingApplication) {
        throw new BadRequestException('You already have an application for this program');
      }

      // appliction number should be in this format: APP-{programId}-{year}-{serialNo}
      const applicationNo = await this.generateApplicationNo(programId);
      const application = await this.prisma.application.create({
        data: {
          ...applicationData,
          programId,
          email,
          applicationNo,
        },
      });

      await this.emailService.sendApplicationStartedEmail(
        email,
        data.firstName,
        applicationNo,
        program.name,
      );

      return application;
    } catch (error) {
      throw error;
    }
  }

  // update school record
  async updateSchoolRecord(input: CreateSchoolRecordDTO) {
    const { applicationId, ...data } = input;
    try {
      const record = await this.prisma.schoolRecord.upsert({
        where: { applicationId },
        create: {
          applicationId,
          ...data,
        },
        update: {
          ...data,
        },
      });

      if (!record) {
        throw new NotFoundException('Application not found for school record update');
      }
      return record;
    } catch (error) {
      throw error;
    }
  }

  // update bank details
  async updateBankDetails(input: CreateBankDetailDTO) {
    try {
      const { applicationId, accountNo, accountName, bankName } = input;
      const bankDetail = await this.prisma.bankDetail.upsert({
        where: { applicationId },
        create: {
          applicationId,
          accountNo,
          accountName,
          bankName,
        },
        update: {
          accountNo,
          accountName,
          bankName,
        },
      });

      if (!bankDetail) {
        throw new NotFoundException('Application not found for bank detail update');
      }
      return bankDetail;
    } catch (error) {
      throw error;
    }
  }

  // upload files
  async uploadDocuments(input: CreateDocumentUploadDTO) {
    try {
      const { applicationId, ...data } = input;
      const documentUpload = await this.prisma.documentUpload.upsert({
        where: { applicationId },
        create: {
          applicationId,
          ...data,
        },
        update: {
          applicationId,
          ...data,
        },
      });

      if (!documentUpload) {
        throw new NotFoundException('Application not found for document upload');
      }
      return documentUpload;
    } catch (error) {
      throw error;
    }
  }

  async submitApplication(id: number) {
    const application = await this.prisma.application.update({
      where: { id },
      data: { status: ApplicationStatusEnum.Submitted },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async getApplicationById(id: number) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        bankDetails: true,
        schoolRecord: true,
        documentUpload: true,
        program: true,
      },
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
      include: {
        bankDetails: true,
        schoolRecord: true,
        documentUpload: true,
        program: true,
      },
    });
    return applications;
  }
  async getApplicationsByProgram(programId: number) {
    const applications = await this.prisma.application.findMany({
      where: { programId },
      include: {
        bankDetails: true,
        schoolRecord: true,
        documentUpload: true,
        program: true,
      },
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
      include: {
        bankDetails: true,
        schoolRecord: true,
        documentUpload: true,
        program: true,
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

  async login(input: ApplicantLoginDTO) {
    const { applicationNo, nin } = input;
    const application = await this.prisma.application.findUnique({
      where: { applicationNo },
      include: { program: true },
    });

    if (!application) {
      throw new UnauthorizedException('Invalid Application Number');
    }

    const cleanNin = nin.replaceAll('-', '').replaceAll(' ', '').trim();

    if (application.nin !== cleanNin && application.nin !== nin) {
      throw new UnauthorizedException('Invalid NIN');
    }

    return application;
  }
}
