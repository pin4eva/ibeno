import { Module } from '@nestjs/common';
import { ProgramsService } from './services/programs.service';
import { ProgramsController } from './controllers/programs.controller';
import { ApplicationService } from './services/application.service';
import { ApplicationController } from './controllers/application.controller';

@Module({
  controllers: [ProgramsController, ApplicationController],
  providers: [ProgramsService, ApplicationService],
})
export class ProgramsModule {}
