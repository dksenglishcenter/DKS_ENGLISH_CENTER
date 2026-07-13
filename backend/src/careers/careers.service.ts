import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateCareerApplicationDto } from './dto/create-career-application.dto';

@Injectable()
export class CareersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCareerApplicationDto) {
    return this.prisma.careerApplication.create({
      data: {
        fullName: dto.fullName.trim(),
        email: dto.email.trim(),
        phone: dto.phone.trim(),
        position: dto.position,
        introduction: dto.introduction?.trim() || null,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  }
}
