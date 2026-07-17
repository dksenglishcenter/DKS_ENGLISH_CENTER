import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CareersService } from './careers.service';
import { CareerApplicationParamsDto } from './dto/career-application-params.dto';
import { CreateCareerApplicationDto } from './dto/create-career-application.dto';
import { ListCareerApplicationsQueryDto } from './dto/list-career-applications-query.dto';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listApplications(@Query() query: ListCareerApplicationsQueryDto) {
    return this.careersService.listApplications(query);
  }

  @Delete('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeApplication(@Param() params: CareerApplicationParamsDto) {
    return this.careersService.removeApplication(params.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCareerApplicationDto) {
    const application = await this.careersService.create(dto);

    return {
      message: 'Đã ghi nhận đơn ứng tuyển. DKS sẽ liên hệ bạn trong 24 giờ.',
      id: application.id,
      createdAt: application.createdAt,
    };
  }
}
