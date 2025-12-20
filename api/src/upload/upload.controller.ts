import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const result = (await this.cloudinaryService.uploadImage(file)) as {
      secure_url: string;
    };
    return { url: result.secure_url };
  }
}
