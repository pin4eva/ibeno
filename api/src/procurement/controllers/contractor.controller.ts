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
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
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

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import contractors from Excel file (Admin)' })
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
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.contractorService.importFromExcel(file);
  }

  @Get('me/bids')
  @ApiOperation({ summary: 'Get bid history for current contractor' })
  async getMyBids(@Query('contractorNo') contractorNo: string) {
    if (!contractorNo) {
      throw new BadRequestException('contractorNo query parameter is required');
    }
    return this.contractorService.getContractorBids(contractorNo);
  }
}
