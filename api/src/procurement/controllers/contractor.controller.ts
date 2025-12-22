import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContractorService } from '../services/contractor.service';
import { FilterContractorsDTO } from '../dto/contractor.dto';

@ApiTags('Contractors')
@Controller('contractors')
export class ContractorController {
  constructor(private readonly contractorService: ContractorService) {}

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
}
