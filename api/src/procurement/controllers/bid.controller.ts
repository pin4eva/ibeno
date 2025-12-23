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
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { ChangeBidStatusDTO, CreateBidDTO, FilterBidsDTO, UpdateBidDTO } from '../dto/bid.dto';
import { BidService } from '../services/bid.service';

@ApiTags('Bids')
@Controller('procurements/:procurementId/bids')
export class BidController {
  constructor(
    private readonly bidService: BidService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'technicalProposal', maxCount: 1 },
      { name: 'commercialProposal', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Submit a bid (Contractor)' })
  @UseInterceptors(FileInterceptor('proposal'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        proposal: { type: 'string', format: 'binary' },
        contractorNo: { type: 'string' },
        contactName: { type: 'string' },
        contactEmail: { type: 'string' },
        contactPhone: { type: 'string' },
        amount: { type: 'number' },
        notes: { type: 'string' },
      },
    },
  })
  async submitBid(
    @Param('procurementId', ParseIntPipe) procurementId: number,
    @Body() input: CreateBidDTO,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      input.proposalUrl = result.secure_url;
    }
    return this.bidService.submitBid(procurementId, input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bids for a procurement (Admin)' })
  async getBidsByProcurement(
    @Param('procurementId', ParseIntPipe) procurementId: number,
    @Query() filter?: FilterBidsDTO,
  ) {
    return this.bidService.getBidsByProcurement(procurementId, filter);
  }

  @Get(':bidId')
  @ApiOperation({ summary: 'Get bid by ID' })
  async getBidById(@Param('bidId', ParseIntPipe) bidId: number) {
    return this.bidService.getBidById(bidId);
  }

  @Patch(':bidId')
  @ApiOperation({ summary: 'Update bid (Contractor)' })
  async updateBid(
    @Param('bidId', ParseIntPipe) bidId: number,
    @Body() input: Omit<UpdateBidDTO, 'id'>,
  ) {
    return this.bidService.updateBid(bidId, { ...input, id: bidId });
  }

  @Post(':bidId/withdraw')
  @ApiOperation({ summary: 'Withdraw bid (Contractor)' })
  async withdrawBid(@Param('bidId', ParseIntPipe) bidId: number) {
    return this.bidService.withdrawBid(bidId);
  }

  @Patch(':bidId/status')
  @ApiOperation({ summary: 'Change bid status (Admin)' })
  async changeBidStatus(
    @Param('bidId', ParseIntPipe) bidId: number,
    @Body() input: ChangeBidStatusDTO,
  ) {
    return this.bidService.changeBidStatus(bidId, input);
  }
}
