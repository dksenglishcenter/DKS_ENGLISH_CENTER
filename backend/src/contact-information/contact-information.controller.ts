import { Body, Controller, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContactInformationService } from './contact-information.service';
import {
  ContactInformationDto,
  UpdateContactInformationDto,
} from './dto/contact-information.dto';

@Controller('contact/info')
export class ContactInformationController {
  constructor(
    private readonly contactInformationService: ContactInformationService,
  ) {}

  @Get()
  async get() {
    const contactInfo = await this.contactInformationService.get();
    return { success: true, data: contactInfo };
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(@Body() dto: UpdateContactInformationDto) {
    const contactInfo = await this.contactInformationService.update(dto);
    return {
      success: true,
      data: contactInfo,
      message: 'Thông tin liên hệ đã được cập nhật thành công.',
    };
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async replace(@Body() dto: ContactInformationDto) {
    const contactInfo = await this.contactInformationService.replace(dto);
    return {
      success: true,
      data: contactInfo,
      message: 'Thông tin liên hệ đã được lưu thành công.',
    };
  }
}
