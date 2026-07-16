import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContactInformationDto,
  UpdateContactInformationDto,
} from './dto/contact-information.dto';

const CONTACT_INFORMATION_ID = 'contact';

@Injectable()
export class ContactInformationService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const contactInformation = await this.prisma.contactInformation.findUnique({
      where: { id: CONTACT_INFORMATION_ID },
    });

    if (!contactInformation) {
      throw new NotFoundException('Không tìm thấy thông tin liên hệ');
    }

    return contactInformation;
  }

  async update(dto: UpdateContactInformationDto) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException(
        'Cần cung cấp ít nhất một trường thông tin để cập nhật',
      );
    }

    try {
      return await this.prisma.contactInformation.update({
        where: { id: CONTACT_INFORMATION_ID },
        data: dto,
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          'Không tìm thấy thông tin liên hệ cần cập nhật',
        );
      }

      throw error;
    }
  }

  replace(dto: ContactInformationDto) {
    return this.prisma.contactInformation.upsert({
      where: { id: CONTACT_INFORMATION_ID },
      create: { id: CONTACT_INFORMATION_ID, ...dto },
      update: dto,
    });
  }
}
