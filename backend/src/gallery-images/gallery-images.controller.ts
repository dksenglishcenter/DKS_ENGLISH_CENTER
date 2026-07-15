import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { ListGalleryImagesQueryDto } from './dto/list-gallery-images-query.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { GalleryImagesService } from './gallery-images.service';

@Controller('gallery-images')
export class GalleryImagesController {
  constructor(private readonly galleryImagesService: GalleryImagesService) {}

  @Get()
  async list(@Query() query: ListGalleryImagesQueryDto) {
    const images = await this.galleryImagesService.list(query);
    return { images };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateGalleryImageDto) {
    const image = await this.galleryImagesService.create(dto);
    return { message: 'Đã thêm ảnh gallery', image };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateGalleryImageDto) {
    const image = await this.galleryImagesService.update(id, dto);
    return { message: 'Đã cập nhật ảnh gallery', image };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.galleryImagesService.remove(id);
  }
}
