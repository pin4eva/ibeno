import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BidService } from '../services/bid.service';
import { CreateBidDTO, UpdateBidDTO, FilterBidsDTO, ChangeBidStatusDTO } from '../dto/bid.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contractorNo: { type: 'string' },
        contactName: { type: 'string' },
        contactEmail: { type: 'string' },
        contactPhone: { type: 'string' },
        price: { type: 'number' },
        notes: { type: 'string' },
        technicalProposal: {
          type: 'string',
          format: 'binary',
        },
        commercialProposal: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async submitBid(
    @Param('procurementId', ParseIntPipe) procurementId: number,
    @Body() input: CreateBidDTO,
    @UploadedFiles()
    files?: {
      technicalProposal?: Express.Multer.File[];
      commercialProposal?: Express.Multer.File[];
    },
  ) {
    let technicalProposalUrl: string | undefined;
    let commercialProposalUrl: string | undefined;

    // Upload technical proposal if provided
    if (files?.technicalProposal?.[0]) {
      const result = await this.cloudinaryService.uploadImage(files.technicalProposal[0]);
      technicalProposalUrl = result.secure_url;
    }

    // Upload commercial proposal if provided
    if (files?.commercialProposal?.[0]) {
      const result = await this.cloudinaryService.uploadImage(files.commercialProposal[0]);
      commercialProposalUrl = result.secure_url;
    }

    return this.bidService.submitBid(procurementId, {
      ...input,
      technicalProposalUrl,
      commercialProposalUrl,
    });
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
