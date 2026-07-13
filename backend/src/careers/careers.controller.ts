import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CareersService } from './careers.service';
import { CreateCareerApplicationDto } from './dto/create-career-application.dto';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

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
