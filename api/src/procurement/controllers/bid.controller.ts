import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BidService } from '../services/bid.service';
import { CreateBidDTO, UpdateBidDTO, FilterBidsDTO, ChangeBidStatusDTO } from '../dto/bid.dto';

@ApiTags('Bids')
@Controller('procurements/:procurementId/bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a bid (Contractor)' })
  async submitBid(
    @Param('procurementId', ParseIntPipe) procurementId: number,
    @Body() input: CreateBidDTO,
  ) {
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
