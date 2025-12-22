import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContractorService } from '../services/contractor.service';
import {
  CreateContractorDTO,
  FilterContractorsDTO,
  UpdateContractorDTO,
} from '../dto/contractor.dto';

@ApiTags('Contractors')
@Controller('contractors')
export class ContractorController {
  constructor(private readonly contractorService: ContractorService) {}

  @Post()
  @ApiOperation({ summary: 'Create contractor (Admin)' })
  async createContractor(@Body() input: CreateContractorDTO) {
    return this.contractorService.createContractor(input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contractors (Admin)' })
  async getAllContractors(@Query() filter?: FilterContractorsDTO) {
    return this.contractorService.getAllContractors(filter);
  }

  @Get(':contractorNo')
  @ApiOperation({ summary: 'Get contractor by contractor number' })
  async getContractorByNo(@Param('contractorNo') contractorNo: string) {
    return this.contractorService.getContractorByNo(contractorNo);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contractor (Admin)' })
  async updateContractor(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateContractorDTO,
  ) {
    return this.contractorService.updateContractor(id, input);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed sample contractors (Admin)' })
  async seedContractors() {
    return this.contractorService.seedContractors();
  }
}
