import { Module } from '@nestjs/common';
import { AssetsService } from './services/assets.service';
import { AssetsController } from './controllers/assets.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
