import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateContactDto) {
    const submission = await this.contactService.create(dto);

    return {
      message: 'Đã ghi nhận yêu cầu tư vấn. DKS sẽ liên hệ bạn sớm nhất.',
      id: submission.id,
      createdAt: submission.createdAt,
    };
  }
}
