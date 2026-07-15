import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { deleteReplacedMedia } from '../common/media-replace';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAboutContentDto } from './dto/update-about-content.dto';

const ABOUT_ID = 'about';

const SELECT = {
  id: true,
  visionImageUrl: true,
  updatedAt: true,
} satisfies Prisma.AboutPageContentSelect;

@Injectable()
export class AboutContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async get() {
    const content = await this.prisma.aboutPageContent.upsert({
      where: { id: ABOUT_ID },
      create: {
        id: ABOUT_ID,
        visionImageUrl: '',
      },
      update: {},
      select: SELECT,
    });

    return content;
  }

  async update(dto: UpdateAboutContentDto) {
    const existing = await this.prisma.aboutPageContent.findUnique({
      where: { id: ABOUT_ID },
      select: { id: true, visionImageUrl: true },
    });

    const nextUrl = dto.visionImageUrl;

    const content = await this.prisma.aboutPageContent.upsert({
      where: { id: ABOUT_ID },
      create: {
        id: ABOUT_ID,
        visionImageUrl: dto.visionImageUrl?.trim() ?? '',
      },
      update: {
        ...(dto.visionImageUrl !== undefined
          ? { visionImageUrl: dto.visionImageUrl.trim() }
          : {}),
      },
      select: SELECT,
    });

    if (existing) {
      await deleteReplacedMedia(
        this.cloudinaryService,
        existing.visionImageUrl,
        nextUrl,
      );
    }

    return content;
  }
}
