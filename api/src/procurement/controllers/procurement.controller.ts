import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProcurementService } from '../services/procurement.service';
import {
  CreateProcurementDTO,
  UpdateProcurementDTO,
  FilterProcurementsDTO,
  UploadProcurementDocumentDTO,
} from '../dto/procurement.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { UserRoleEnum } from '../../generated/enums';

@ApiTags('Procurements')
@Controller('procurements')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor)
  @ApiOperation({ summary: 'Create a new procurement (Admin)' })
  async createProcurement(@Body() input: CreateProcurementDTO) {
    return this.procurementService.createProcurement(input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all procurements with filters' })
  async getAllProcurements(@Query() filter?: FilterProcurementsDTO) {
    return this.procurementService.getAllProcurements(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get procurement by ID' })
  async getProcurementById(@Param('id', ParseIntPipe) id: number) {
    return this.procurementService.getProcurementById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor)
  @ApiOperation({ summary: 'Update procurement (Admin)' })
  async updateProcurement(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: Omit<UpdateProcurementDTO, 'id'>,
  ) {
    return this.procurementService.updateProcurement({ ...input, id });
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin)
  @ApiOperation({ summary: 'Delete/archive procurement (Admin)' })
  async deleteProcurement(@Param('id', ParseIntPipe) id: number) {
    return this.procurementService.deleteProcurement(id);
  }

  @Post(':id/documents')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor)
  @ApiOperation({ summary: 'Upload procurement document (Admin)' })
  async uploadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UploadProcurementDocumentDTO,
  ) {
    return this.procurementService.uploadDocument(id, input);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get procurement documents' })
  async getDocuments(@Param('id', ParseIntPipe) id: number) {
    return this.procurementService.getDocuments(id);
  }

  @Delete('documents/:documentId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin, UserRoleEnum.Editor)
  @ApiOperation({ summary: 'Delete procurement document (Admin)' })
  async deleteDocument(@Param('documentId', ParseIntPipe) documentId: number) {
    return this.procurementService.deleteDocument(documentId);
  }

  @Post('seed')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoleEnum.Admin)
  @ApiOperation({ summary: 'Seed sample procurements (Admin)' })
  async seedProcurements() {
    return this.procurementService.seedProcurements();
  }
}
