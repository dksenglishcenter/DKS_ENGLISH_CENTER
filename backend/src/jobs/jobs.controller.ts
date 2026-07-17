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
import { CreateJobDto } from './dto/create-job.dto';
import { JobParamsDto } from './dto/job-params.dto';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  //Lấy các vị trí tuyển dụng đã được published
  @Get()
  async listPublished() {
    const jobs = await this.jobsService.listPublished();
    return { success: true, data: jobs };
  }

  //Lấy tất cả các vị trí tuyển dụng (cả published và unpublished) cho admin
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async listForAdmin(@Query() query: ListJobsQueryDto) {
    const { data, meta } = await this.jobsService.listForAdmin(query);
    return { success: true, data, meta };
  }

  //Lấy vị trí tuyển dụng đã được published theo id
  @Get(':id')
  async findPublishedById(@Param() params: JobParamsDto) {
    const job = await this.jobsService.findPublishedById(params.id);
    return { success: true, data: job };
  }

  //Tạo vị trí tuyển dụng mới (chỉ dành cho admin)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateJobDto) {
    const job = await this.jobsService.create(dto);
    return {
      success: true,
      data: job,
      message: 'Đã tạo vị trí tuyển dụng',
    };
  }

  //Cập nhật vị trí tuyển dụng (chỉ dành cho admin)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Param() params: JobParamsDto, @Body() dto: UpdateJobDto) {
    const job = await this.jobsService.update(params.id, dto);
    return {
      success: true,
      data: job,
      message: 'Đã cập nhật vị trí tuyển dụng',
    };
  }

  //Xóa vị trí tuyển dụng (chỉ dành cho admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param() params: JobParamsDto) {
    await this.jobsService.remove(params.id);
    return {
      success: true,
      data: null,
      message: 'Đã xóa vị trí tuyển dụng',
    };
  }
}
