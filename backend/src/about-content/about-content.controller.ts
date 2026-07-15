import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AboutContentService } from './about-content.service';
import { UpdateAboutContentDto } from './dto/update-about-content.dto';

@Controller('about-content')
export class AboutContentController {
  constructor(private readonly aboutContentService: AboutContentService) {}

  @Get()
  async get() {
    const content = await this.aboutContentService.get();
    return { content };
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Body() dto: UpdateAboutContentDto) {
    const content = await this.aboutContentService.update(dto);
    return { message: 'Đã cập nhật nội dung About', content };
  }
}
