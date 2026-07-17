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
import { ContactService } from './contact.service';
import { ContactSubmissionParamsDto } from './dto/contact-submission-params.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactSubmissionsQueryDto } from './dto/list-contact-submissions-query.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listSubmissions(@Query() query: ListContactSubmissionsQueryDto) {
    return this.contactService.listSubmissions(query);
  }

  @Delete('submissions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeSubmission(@Param() params: ContactSubmissionParamsDto) {
    return this.contactService.removeSubmission(params.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateContactDto) {
    const submission = await this.contactService.create(dto);

    return {
      success: true,
      data: {
        id: submission.id,
        createdAt: submission.createdAt,
      },
      message: 'Đã ghi nhận yêu cầu tư vấn. DKS sẽ liên hệ bạn sớm nhất.',
    };
  }
}
