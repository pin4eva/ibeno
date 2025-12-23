import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { ProcurementController } from './controllers/procurement.controller';
import { BidController } from './controllers/bid.controller';
import { ContractorController } from './controllers/contractor.controller';
import { ProcurementService } from './services/procurement.service';
import { BidService } from './services/bid.service';
import { ContractorService } from './services/contractor.service';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ProcurementController, BidController, ContractorController],
  providers: [ProcurementService, BidService, ContractorService],
  exports: [ProcurementService, BidService, ContractorService],
})
export class ProcurementModule {}
