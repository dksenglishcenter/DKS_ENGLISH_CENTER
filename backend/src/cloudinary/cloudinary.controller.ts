import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  ServiceUnavailableException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Role } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequestUser } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CloudinaryService } from './cloudinary.service';
import { DeleteMediaDto } from './dto/delete-media.dto';
import { RestoreMediaDto, StashMediaDto } from './dto/stash-media.dto';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PARENT)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser() actor: AuthRequestUser,
  ) {
    if (!file) {
      throw new BadRequestException('Thiếu file ảnh (field: file)');
    }

    if (actor.role === Role.PARENT && dto.category !== 'tuition-proof') {
      throw new ForbiddenException(
        'Phụ huynh chỉ được upload minh chứng học phí.',
      );
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

  /** Xóa ảnh orphan (upload rồi nhưng không save form). Folder: courses | home/gallery. */
  @Post('delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async delete(@Body() dto: DeleteMediaDto) {
    const publicId = this.cloudinaryService.extractManagedPublicId(dto.url);
    if (!publicId) {
      throw new BadRequestException(
        'Chỉ xóa được ảnh trong folder courses / home/gallery / about/* trên Cloudinary',
      );
    }

    const deleted = await this.cloudinaryService.deleteImageByUrl(dto.url);
    return {
      message: deleted ? 'Đã xóa ảnh Cloudinary' : 'Không tìm thấy ảnh hoặc đã xóa trước đó',
      publicId,
      deleted,
    };
  }

  /**
   * Đưa ảnh hiện tại vào _stash (không còn ở vị trí cũ) trước khi upload ảnh thay thế.
   * Hủy form → restore; Lưu form → destroy stash.
   */
  @Post('stash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async stash(@Body() dto: StashMediaDto) {
    const result = await this.cloudinaryService.stashManagedImage(dto.url);
    if (!result) {
      throw new BadRequestException(
        'Không stash được ảnh — URL không thuộc folder quản lý Cloudinary',
      );
    }
    return {
      message: 'Đã tạm ẩn ảnh cũ',
      ...result,
    };
  }

  @Post('restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async restore(@Body() dto: RestoreMediaDto) {
    const result = await this.cloudinaryService.restoreStashedImage(
      dto.stashPublicId,
      dto.originalPublicId,
    );
    if (!result) {
      throw new BadRequestException('Không khôi phục được ảnh từ stash');
    }
    return {
      message: 'Đã khôi phục ảnh cũ',
      url: result.url,
      publicId: result.publicId,
    };
  }

  @Post('delete-by-public-id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteByPublicId(@Body() body: { publicId: string }) {
    const ok =
      body?.publicId?.startsWith('dks-english-center/courses/') ||
      body?.publicId?.startsWith('dks-english-center/home/gallery/') ||
      body?.publicId?.startsWith('dks-english-center/about/') ||
      body?.publicId?.startsWith('dks-english-center/blog/') ||
      body?.publicId?.startsWith('dks-english-center/tuition/proofs/');
    if (!ok) {
      throw new BadRequestException('publicId không hợp lệ');
    }
    const deleted = await this.cloudinaryService.deleteImageByPublicId(
      body.publicId,
    );
    return {
      message: deleted ? 'Đã xóa ảnh Cloudinary' : 'Không tìm thấy ảnh hoặc đã xóa trước đó',
      publicId: body.publicId,
      deleted,
    };
  }
}
