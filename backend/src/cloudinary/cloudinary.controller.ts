import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { CloudinaryService } from './cloudinary.service';
import { UploadMediaDto } from './dto/upload-media.dto';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

@Controller('media')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('cloudinary/health')
  async getHealth() {
    try {
      const result = await this.cloudinaryService.ping();
      return {
        status: 'ok',
        cloudinary: result,
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException('Cloudinary connection failed');
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
  ) {
    if (!file) {
      throw new BadRequestException('Thiếu file ảnh (field: file)');
    }

    const result = await this.cloudinaryService.uploadImage(file, {
      category: dto.category,
      platform: dto.platform,
      publicId: dto.publicId,
    });

    return {
      message: 'Upload thành công',
      url: result.secure_url,
      publicId: result.public_id,
      folder: result.folder,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }
}
