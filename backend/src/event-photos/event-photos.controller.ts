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
import { CreateEventPhotoDto } from './dto/create-event-photo.dto';
import { ListEventPhotosQueryDto } from './dto/list-event-photos-query.dto';
import { UpdateEventPhotoDto } from './dto/update-event-photo.dto';
import { EventPhotosService } from './event-photos.service';

@Controller('event-photos')
export class EventPhotosController {
  constructor(private readonly eventPhotosService: EventPhotosService) {}

  @Get()
  async list(@Query() query: ListEventPhotosQueryDto) {
    const images = await this.eventPhotosService.list(query);
    return { images };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEventPhotoDto) {
    const image = await this.eventPhotosService.create(dto);
    return { message: 'Đã thêm ảnh sự kiện', image };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateEventPhotoDto) {
    const image = await this.eventPhotosService.update(id, dto);
    return { message: 'Đã cập nhật ảnh sự kiện', image };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.eventPhotosService.remove(id);
  }
}
