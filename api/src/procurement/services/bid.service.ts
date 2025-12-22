import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateBidDTO,
  UpdateBidDTO,
  FilterBidsDTO,
  ChangeBidStatusDTO,
  BidStatusEnum,
} from '../dto/bid.dto';
import { ProcurementStatusEnum } from '../dto/procurement.dto';

@Injectable()
export class BidService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate contractor and procurement for bidding
   */
  private async validateBidding(procurementId: number, contractorNo: string) {
    // Check procurement exists and is published
    const procurement = await this.prisma.procurement.findUnique({
      where: { id: procurementId },
    });

    if (!procurement) {
      throw new NotFoundException(`Procurement with ID ${procurementId} not found`);
    }

    if (procurement.status !== ProcurementStatusEnum.published) {
      throw new BadRequestException('This procurement is not accepting bids');
    }

    // Check deadline
    if (new Date() > new Date(procurement.submissionDeadline)) {
      throw new BadRequestException('Submission deadline has passed');
    }

    // Check contractor exists and is active
    const contractor = await this.prisma.contractor.findUnique({
      where: { contractorNo },
    });

    if (!contractor) {
      throw new NotFoundException(`Contractor with number ${contractorNo} not found`);
    }

    if (contractor.status !== 'ACTIVE') {
      throw new BadRequestException('Contractor is not active');
    }

    return { procurement, contractor };
  }

  /**
   * Create or update a bid
   */
  async submitBid(procurementId: number, input: CreateBidDTO) {
    const { contractor } = await this.validateBidding(procurementId, input.contractorNo);

    // Check if bid already exists
    const existingBid = await this.prisma.bid.findUnique({
      where: {
        procurementId_contractorId: {
          procurementId,
          contractorId: contractor.id,
        },
      },
    });

    if (existingBid) {
      // Update existing bid
      const updatedBid = await this.prisma.bid.update({
        where: { id: existingBid.id },
        data: {
          ...input,
          status: BidStatusEnum.submitted,
          updatedAt: new Date(),
        },
        include: {
          contractor: true,
          procurement: true,
        },
      });

      // Create audit event
      await this.prisma.bidEvent.create({
        data: {
          bidId: updatedBid.id,
          action: 'bid_updated',
          metadata: JSON.stringify({ note: 'Bid updated by contractor' }),
        },
      });

      return updatedBid;
    }

    // Create new bid
    const bid = await this.prisma.bid.create({
      data: {
        ...input,
        procurementId,
        contractorId: contractor.id,
      },
      include: {
        contractor: true,
        procurement: true,
      },
    });

    // Create audit event
    await this.prisma.bidEvent.create({
      data: {
        bidId: bid.id,
        action: 'bid_submitted',
        metadata: JSON.stringify({ note: 'New bid submitted' }),
      },
    });

    return bid;
  }

  /**
   * Get all bids for a procurement
   */
  async getBidsByProcurement(procurementId: number, filter?: FilterBidsDTO) {
    const where: Record<string, unknown> = { procurementId };

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.contractorNo) {
      where.contractorNo = filter.contractorNo;
    }

    if (filter?.search) {
      where.OR = [
        { contractorNo: { contains: filter.search, mode: 'insensitive' } },
        { contractor: { companyName: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.bid.findMany({
      where,
      include: {
        contractor: true,
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  /**
   * Get bid by ID
   */
  async getBidById(bidId: number) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        contractor: true,
        procurement: true,
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bidId} not found`);
    }

    return bid;
  }

  /**
   * Update bid (contractor can only update their own before deadline)
   */
  async updateBid(bidId: number, input: UpdateBidDTO) {
    const bid = await this.getBidById(bidId);

    // Check if deadline has passed
    const procurement = await this.prisma.procurement.findUnique({
      where: { id: bid.procurementId },
    });

    if (procurement && new Date() > new Date(procurement.submissionDeadline)) {
      throw new BadRequestException('Cannot update bid after submission deadline');
    }

    if (
      procurement &&
      procurement.status !== ProcurementStatusEnum.published
    ) {
      throw new BadRequestException('Cannot update bid for this procurement');
    }

    const updatedBid = await this.prisma.bid.update({
      where: { id: bidId },
      data: input,
      include: {
        contractor: true,
        procurement: true,
      },
    });

    // Create audit event
    await this.prisma.bidEvent.create({
      data: {
        bidId: updatedBid.id,
        action: 'bid_updated',
        metadata: JSON.stringify({ note: 'Bid updated by contractor' }),
      },
    });

    return updatedBid;
  }

  /**
   * Withdraw bid
   */
  async withdrawBid(bidId: number) {
    const bid = await this.getBidById(bidId);

    if (bid.status === BidStatusEnum.withdrawn) {
      throw new BadRequestException('Bid is already withdrawn');
    }

    if (bid.status === BidStatusEnum.awarded) {
      throw new BadRequestException('Cannot withdraw awarded bid');
    }

    const updatedBid = await this.prisma.bid.update({
      where: { id: bidId },
      data: { status: BidStatusEnum.withdrawn },
      include: {
        contractor: true,
        procurement: true,
      },
    });

    // Create audit event
    await this.prisma.bidEvent.create({
      data: {
        bidId: updatedBid.id,
        action: 'bid_withdrawn',
        metadata: JSON.stringify({ note: 'Bid withdrawn by contractor' }),
      },
    });

    return updatedBid;
  }

  /**
   * Change bid status (admin only)
   */
  async changeBidStatus(bidId: number, input: ChangeBidStatusDTO) {
    const bid = await this.getBidById(bidId);

    // If awarding, check no other bid is awarded for this procurement
    if (input.status === BidStatusEnum.awarded) {
      const awardedBid = await this.prisma.bid.findFirst({
        where: {
          procurementId: bid.procurementId,
          status: BidStatusEnum.awarded,
        },
      });

      if (awardedBid && awardedBid.id !== bidId) {
        throw new BadRequestException('Another bid is already awarded for this procurement');
      }
    }

    const updatedBid = await this.prisma.bid.update({
      where: { id: bidId },
      data: { status: input.status },
      include: {
        contractor: true,
        procurement: true,
      },
    });

    // Create audit event
    await this.prisma.bidEvent.create({
      data: {
        bidId: updatedBid.id,
        action: `bid_status_changed_to_${input.status}`,
        actorId: input.actorId,
        actorRole: input.actorRole,
        metadata: input.metadata,
      },
    });

    // Update procurement status if bid is awarded
    if (input.status === BidStatusEnum.awarded) {
      await this.prisma.procurement.update({
        where: { id: bid.procurementId },
        data: { status: ProcurementStatusEnum.awarded },
      });
    }

    return updatedBid;
  }
}
