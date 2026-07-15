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
import { CreateFacilityImageDto } from './dto/create-facility-image.dto';
import { ListFacilityImagesQueryDto } from './dto/list-facility-images-query.dto';
import { UpdateFacilityImageDto } from './dto/update-facility-image.dto';
import { FacilityImagesService } from './facility-images.service';

@Controller('facility-images')
export class FacilityImagesController {
  constructor(private readonly facilityImagesService: FacilityImagesService) {}

  @Get()
  async list(@Query() query: ListFacilityImagesQueryDto) {
    const images = await this.facilityImagesService.list(query);
    return { images };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFacilityImageDto) {
    const image = await this.facilityImagesService.create(dto);
    return { message: 'Đã thêm ảnh cơ sở vật chất', image };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateFacilityImageDto) {
    const image = await this.facilityImagesService.update(id, dto);
    return { message: 'Đã cập nhật ảnh cơ sở vật chất', image };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.facilityImagesService.remove(id);
  }
}
