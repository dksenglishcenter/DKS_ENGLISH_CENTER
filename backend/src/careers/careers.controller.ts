import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { Role } from '../../generated/prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { THROTTLE_CAREER_APPLY } from '../common/throttle.constants';
import { CareersService } from './careers.service';
import { CareerApplicationParamsDto } from './dto/career-application-params.dto';
import { CreateCareerApplicationDto } from './dto/create-career-application.dto';
import { ListCareerApplicationsQueryDto } from './dto/list-career-applications-query.dto';

const MAX_CV_SIZE = 5 * 1024 * 1024;

function contentDispositionAttachment(fileName: string) {
  const ascii =
    fileName
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '_')
      .replace(/["\\]/g, '_')
      .trim() || 'CV.pdf';
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listApplications(@Query() query: ListCareerApplicationsQueryDto) {
    return this.careersService.listApplications(query);
  }

  @Get('applications/:id/cv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async downloadCv(
    @Param() params: CareerApplicationParamsDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, fileName, contentType } =
      await this.careersService.downloadCv(params.id);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': contentDispositionAttachment(fileName),
      'Content-Length': String(buffer.length),
      'Cache-Control': 'private, no-store',
    });
    return new StreamableFile(buffer);
  }

  @Delete('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeApplication(@Param() params: CareerApplicationParamsDto) {
    return this.careersService.removeApplication(params.id);
  }

  @Post('upload-cv')
  @Throttle(THROTTLE_CAREER_APPLY)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_CV_SIZE },
    }),
  )
  async uploadCv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Thiếu file CV (field: file)');
    }
    const uploaded = await this.careersService.uploadCv(file);
    return {
      success: true,
      data: uploaded,
      message: 'Upload CV thành công',
    };
  }

  @Post()
  @Throttle(THROTTLE_CAREER_APPLY)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCareerApplicationDto) {
    const application = await this.careersService.create(dto);

    return {
      success: true,
      data: {
        id: application.id,
        createdAt: application.createdAt,
      },
      message: 'Đã ghi nhận đơn ứng tuyển. DKS sẽ liên hệ bạn trong 24 giờ.',
    };
  }
}
