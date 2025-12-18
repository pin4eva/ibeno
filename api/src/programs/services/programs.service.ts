import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProgramDTO, FilterProgramsDTO, UpdateProgramDTO } from '../dto/programs.dto';
import { Prisma } from 'src/generated/client';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  // create program
  async createProgram(input: CreateProgramDTO) {
    const { name } = input;
    let startDate: Date | undefined = undefined,
      endDate: Date | undefined = undefined;
    if (input?.startDate) {
      startDate = new Date(input.startDate);
    }
    if (input?.endDate) {
      endDate = new Date(input.endDate);
    }
    try {
      const existingProgram = await this.prisma.program.findUnique({
        where: { name },
      });
      if (existingProgram) {
        throw new BadRequestException('Program with this name already exists');
      }
      const newProgram = await this.prisma.program.create({
        data: {
          ...input,
          name,
          startDate,
          endDate,
        },
      });
      return newProgram;
    } catch (error) {
      throw error;
    }
  }

  // update program
  async updateProgram(input: UpdateProgramDTO) {
    const { id, ...data } = input;
    try {
      const program = await this.prisma.program.findUnique({
        where: { id },
      });
      if (!program) {
        throw new BadRequestException('Program not found');
      }
      const updatedProgram = await this.prisma.program.update({
        where: { id },
        data,
      });
      return updatedProgram;
    } catch (error) {
      throw error;
    }
  }

  // delete program
  async deleteProgram(id: number) {
    try {
      const program = await this.prisma.program.findUnique({
        where: { id },
      });
      if (!program) {
        throw new NotFoundException('Program not found');
      }
      await this.prisma.program.delete({
        where: { id },
      });
      return { message: 'Program deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
  // get all programs
  async getAllPrograms(filter?: FilterProgramsDTO) {
    try {
      const where: Prisma.ProgramWhereInput = {};
      if (filter?.category) {
        where.category = filter.category;
      }
      if (filter?.isActive !== undefined) {
        where.isActive = filter.isActive;
      }
      const programs = await this.prisma.program.findMany({
        where,
      });
      return programs;
    } catch (error) {
      throw error;
    }
  }

  // get program by id
  async getProgramById(id: number) {
    try {
      const program = await this.prisma.program.findUnique({
        where: { id },
      });
      if (!program) {
        throw new NotFoundException('Program not found');
      }
      return program;
    } catch (error) {
      throw error;
    }
  }

  async toggleProgramEnrollment(id: number) {
    try {
      const program = await this.prisma.program.findUnique({
        where: { id },
      });
      if (!program) {
        throw new NotFoundException('Program not found');
      }
      const updatedProgram = await this.prisma.program.update({
        where: { id },
        data: { isActive: !program.isActive },
      });
      return updatedProgram;
    } catch (error) {
      throw error;
    }
  }
}
