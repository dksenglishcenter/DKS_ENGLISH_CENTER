import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { deleteReplacedMedia } from '../common/media-replace';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { ListCoursesQueryDto } from './dto/list-courses-query.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

const COURSE_SELECT = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  description: true,
  level: true,
  target: true,
  tuition: true,
  duration: true,
  perks: true,
  category: true,
  coverImageUrl: true,
  accent: true,
  bg: true,
  icon: true,
  featured: true,
  sortOrder: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CourseSelect;

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  list(query: ListCoursesQueryDto) {
    const where: Prisma.CourseWhereInput = {};

    const publishedOnly = query.publishedOnly !== false;
    if (publishedOnly) {
      where.isPublished = true;
    }

    if (query.featured !== undefined) {
      where.featured = query.featured;
    }

    if (query.category) {
      where.category = query.category;
    }

    return this.prisma.course.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: COURSE_SELECT,
    });
  }

  async findBySlug(slug: string, publishedOnly = true) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      select: COURSE_SELECT,
    });

    if (!course || (publishedOnly && !course.isPublished)) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    return course;
  }

  async create(dto: CreateCourseDto) {
    try {
      return await this.prisma.course.create({
        data: {
          slug: dto.slug,
          title: dto.title,
          subtitle: dto.subtitle,
          description: dto.description,
          level: dto.level,
          target: dto.target,
          tuition: dto.tuition,
          duration: dto.duration,
          perks: dto.perks,
          category: dto.category,
          coverImageUrl: dto.coverImageUrl,
          accent: dto.accent ?? '#F16522',
          bg: dto.bg ?? '#FFF4EC',
          icon: dto.icon ?? '📚',
          featured: dto.featured ?? true,
          sortOrder: dto.sortOrder ?? 0,
          isPublished: dto.isPublished ?? true,
        },
        select: COURSE_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Slug khóa học đã tồn tại');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCourseDto) {
    const existing = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true, coverImageUrl: true },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    const nextCoverUrl = dto.coverImageUrl;

    try {
      const course = await this.prisma.course.update({
        where: { id },
        data: {
          ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.subtitle !== undefined ? { subtitle: dto.subtitle } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(dto.level !== undefined ? { level: dto.level } : {}),
          ...(dto.target !== undefined ? { target: dto.target } : {}),
          ...(dto.tuition !== undefined ? { tuition: dto.tuition } : {}),
          ...(dto.duration !== undefined ? { duration: dto.duration } : {}),
          ...(dto.perks !== undefined ? { perks: dto.perks } : {}),
          ...(dto.category !== undefined ? { category: dto.category } : {}),
          ...(dto.coverImageUrl !== undefined
            ? { coverImageUrl: dto.coverImageUrl }
            : {}),
          ...(dto.accent !== undefined ? { accent: dto.accent } : {}),
          ...(dto.bg !== undefined ? { bg: dto.bg } : {}),
          ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
          ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isPublished !== undefined
            ? { isPublished: dto.isPublished }
            : {}),
        },
        select: COURSE_SELECT,
      });

      await deleteReplacedMedia(
        this.cloudinaryService,
        existing.coverImageUrl,
        nextCoverUrl,
      );

      return course;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Slug khóa học đã tồn tại');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true, coverImageUrl: true },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    await this.prisma.course.delete({ where: { id } });
    await this.cloudinaryService.deleteImageByUrl(existing.coverImageUrl);

    return { message: 'Đã xóa khóa học và ảnh Cloudinary (nếu có)' };
  }
}
