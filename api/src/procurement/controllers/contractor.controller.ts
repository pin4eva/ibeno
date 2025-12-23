import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContractorService } from '../services/contractor.service';
import { BidService } from '../services/bid.service';
import { AuthGuard } from '../../guards/auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import {
  CreateContractorDTO,
  FilterContractorsDTO,
  UpdateContractorDTO,
} from '../dto/contractor.dto';

@ApiTags('Contractors')
@Controller('contractors')
export class ContractorController {
  constructor(
    private readonly contractorService: ContractorService,
    private readonly bidService: BidService,
  ) {}

  @Get('me/bids')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current contractor bids' })
  async getMyBids(@CurrentUser() user: { id: number; email: string }) {
    const contractor = await this.contractorService.getContractorByEmail(user.email);
    if (!contractor) {
      throw new BadRequestException('Contractor profile not found for this user');
    }
    return this.bidService.getBidsByContractor(contractor.id);
  }

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

  @Post('import')
  @ApiOperation({ summary: 'Import contractors from Excel (Admin)' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async importContractors(@UploadedFile() file: Express.Multer.File) {
    return this.contractorService.importContractors(file.buffer);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed sample contractors (Admin)' })
  async seedContractors() {
    return this.contractorService.seedContractors();
  }
}
