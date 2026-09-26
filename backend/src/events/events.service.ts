import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { swapSortOrderIfNeeded } from '../common/sort-order';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const SELECT = {
  id: true,
  title: true,
  summary: true,
  body: true,
  eventDate: true,
  coverImageUrl: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventSelect;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: ListEventsQueryDto) {
    const where: Prisma.EventWhereInput = {};
    if (query.publishedOnly !== false) {
      where.isPublished = true;
    }

    return this.prisma.event.findMany({
      where,
      orderBy: [
        { eventDate: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      select: SELECT,
    });
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title.trim(),
        summary: dto.summary.trim(),
        body: dto.body?.trim() || null,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
        coverImageUrl: dto.coverImageUrl?.trim() || null,
        sortOrder: dto.sortOrder ?? 0,
        isPublished: dto.isPublished ?? true,
      },
      select: SELECT,
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, sortOrder: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy sự kiện');

    return this.prisma.$transaction(async (tx) => {
      await swapSortOrderIfNeeded(tx.event, {
        id,
        currentOrder: existing.sortOrder,
        nextOrder: dto.sortOrder,
      });

      return tx.event.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.summary !== undefined ? { summary: dto.summary.trim() } : {}),
          ...(dto.body !== undefined ? { body: dto.body?.trim() || null } : {}),
          ...(dto.eventDate !== undefined
            ? { eventDate: dto.eventDate ? new Date(dto.eventDate) : null }
            : {}),
          ...(dto.coverImageUrl !== undefined
            ? { coverImageUrl: dto.coverImageUrl?.trim() || null }
            : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isPublished !== undefined
            ? { isPublished: dto.isPublished }
            : {}),
        },
        select: SELECT,
      });
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy sự kiện');

    await this.prisma.event.delete({ where: { id } });
    return { message: 'Đã xóa sự kiện thành công' };
  }
}
