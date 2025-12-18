import { Module } from '@nestjs/common';
import { ProgramsService } from './services/programs.service';
import { ProgramsController } from './controllers/programs.controller';

@Module({
  controllers: [ProgramsController],
  providers: [ProgramsService],
})
export class ProgramsModule {}
