import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { Application, Prisma, Program } from '../../generated/client';
import { PrismaService } from '../../prisma.service';
import {
  ApplicantLoginDTO,
  ApplicationDTO,
  ApplicationStatusEnum,
  CreateBankDetailDTO,
  CreateDocumentUploadDTO,
  CreateSchoolRecordDTO,
  FilterApplicationsDTO,
  OldApplicationDTO,
  OldProgramDTO,
} from '../dto/application.dto';
import { ProgramCategoryEnum } from '../dto/programs.dto';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createApplication(input: ApplicationDTO, origin: string) {
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

        if (
          updatedApplication?.state &&
          updatedApplication?.lga &&
          updatedApplication?.address &&
          updatedApplication?.ekpuk
        ) {
          await this.prisma.application.update({
            where: { id },
            data: { complete: true },
          });
        }

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
        origin,
      );

      return application;
    } catch (error) {
      throw error;
    }
  }

  async uploadPassport(applicationId: number, passportUrl: string) {
    try {
      const application = await this.prisma.application.update({
        where: { id: applicationId },
        data: { passport: passportUrl },
      });

      if (!application) {
        throw new NotFoundException('Application not found for passport upload');
      }
      return application;
    } catch (error) {
      throw error;
    }
  }

  // update school record
  async updateSchoolRecord(input: CreateSchoolRecordDTO) {
    const { applicationId, ...data } = input;
    try {
      const existingRegNo = await this.prisma.schoolRecord.findFirst({
        where: {
          regNo: data.regNo,
          applicationId: { not: applicationId },
        },
      });
      if (existingRegNo) {
        throw new BadRequestException('Registration number already exists for another application');
      }
      const record = await this.prisma.schoolRecord.upsert({
        where: { applicationId },
        create: {
          applicationId,
          ...data,
          complete: true,
        },
        update: {
          ...data,
          complete: true,
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
          complete: true,
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
      const programCollection = mongoDb.collection<OldProgramDTO>('sessions');

      const applications = await applicationCollection.find().toArray();
      const sessions = await programCollection.find().toArray();
      const emails = new Set<string>();
      const nins = new Set<string>();
      const applicationsInDB: Application[] = [];

      const programs: Program[] = [];

      for (const session of sessions) {
        const program = await this.prisma.program.upsert({
          where: { name: session.name },
          create: {
            name: session.name,
            category: ProgramCategoryEnum.Education,
            description: session.description,
            subCategory: session.type,
            createdAt: session.startDate,
            updatedAt: session.endDate,
            isActive: session.isActive,
            startDate: session.startDate,
            endDate: session.endDate,
          },
          update: {
            description: session.description,
            subCategory: session.type,
            createdAt: session.startDate,
            updatedAt: session.endDate,
            isActive: session.isActive,
            startDate: session.startDate,
            endDate: session.endDate,
          },
        });
        programs.push(program);
      }

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
        const program = programs.find((p) => p.subCategory === application.type);
        const programId = program ? program.id : application?.type == 'Free Jamb' ? 1 : 2;
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
      include: { program: true, schoolRecord: true, bankDetails: true, documentUpload: true },
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

  async updateApplicationStatus(
    id: number,
    status: ApplicationStatusEnum,
    comment?: string,
  ): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id },
      data: {
        status,
        comment: comment || application.comment,
      },
      include: {
        bankDetails: true,
        schoolRecord: true,
        documentUpload: true,
        program: true,
      },
    });

    // Send email notification to applicant about status change
    if (updatedApplication.email) {
      const statusMessages = {
        [ApplicationStatusEnum.Accepted]: 'has been approved',
        [ApplicationStatusEnum.Rejected]: 'has been rejected',
        [ApplicationStatusEnum.Reviewed]: 'is under review',
        [ApplicationStatusEnum.InProgress]: 'is in progress',
        [ApplicationStatusEnum.Submitted]: 'has been submitted',
      };

      const message = statusMessages[status] || 'has been updated';

      await this.emailService.sendApplicationStatusUpdate(
        updatedApplication.email,
        updatedApplication.firstName,
        updatedApplication.applicationNo || '',
        message,
        comment,
      );
    }

    return updatedApplication;
  }

  /**
   * Send "Application Started" emails in bulk for a program.
   * Returns a summary of successes and failures.
   */
  async bulkSendApplicationStartedEmail(programId: number, origin: string) {
    const program = await this.prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw new NotFoundException('Program not found');

    const applicationsAll = await this.prisma.application.findMany({ where: { programId } });
    const applications = applicationsAll.filter((a) => !!a.email);

    const result = {
      total: applications.length,
      success: 0,
      failed: 0,
      failures: [] as Array<{ id: number; email?: string | null; error?: string }>,
    };

    for (const app of applications) {
      try {
        if (!app.email) {
          result.failed++;
          result.failures.push({ id: app.id, email: app.email, error: 'Missing email' });
          continue;
        }
        await this.emailService.sendApplicationStartedEmail(
          app.email,
          app.firstName || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Applicant',
          app.applicationNo || '',
          program.name,
          origin || '',
        );
        result.success++;
      } catch (err) {
        result.failed++;
        result.failures.push({ id: app.id, email: app.email, error: err?.message || String(err) });
      }
    }

    return result;
  }

  async bulkDeleteApplications(ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('No application ids provided');
    }

    const result = await this.prisma.application.deleteMany({ where: { id: { in: ids } } });
    return { count: result.count };
  }

  async getStudentApplications(nin: string) {
    return this.prisma.application.findMany({
      where: { nin },
      include: {
        program: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
