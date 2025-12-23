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
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BidService } from '../services/bid.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { CreateBidDTO, UpdateBidDTO, FilterBidsDTO, ChangeBidStatusDTO } from '../dto/bid.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@ApiTags('Bids')
@Controller('procurements/:procurementId/bids')
export class BidController {
  constructor(
    private readonly bidService: BidService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
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
