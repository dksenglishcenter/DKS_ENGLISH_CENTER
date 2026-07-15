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
import { CreateSuccessStoryDto } from './dto/create-success-story.dto';
import { ListSuccessStoriesQueryDto } from './dto/list-success-stories-query.dto';
import { UpdateSuccessStoryDto } from './dto/update-success-story.dto';
import { SuccessStoriesService } from './success-stories.service';

@Controller('success-stories')
export class SuccessStoriesController {
  constructor(private readonly successStoriesService: SuccessStoriesService) {}

  @Get()
  async list(@Query() query: ListSuccessStoriesQueryDto) {
    const stories = await this.successStoriesService.list(query);
    return { stories };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSuccessStoryDto) {
    const story = await this.successStoriesService.create(dto);
    return { message: 'Đã tạo câu chuyện', story };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateSuccessStoryDto) {
    const story = await this.successStoriesService.update(id, dto);
    return { message: 'Đã cập nhật câu chuyện', story };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.successStoriesService.remove(id);
  }
}
