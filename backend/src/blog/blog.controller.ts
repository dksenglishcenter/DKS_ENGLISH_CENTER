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
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { ListBlogPostsQueryDto } from './dto/list-blog-posts-query.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Controller('blog-posts')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async list(@Query() query: ListBlogPostsQueryDto) {
    const blogPosts = await this.blogService.list(query);
    return { blogPosts };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const blogPost = await this.blogService.findBySlug(slug, true);
    return { blogPost };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBlogPostDto) {
    const blogPost = await this.blogService.create(dto);
    return { message: 'Đã tạo bài viết', blogPost };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    const blogPost = await this.blogService.update(id, dto);
    return { message: 'Đã cập nhật bài viết', blogPost };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
