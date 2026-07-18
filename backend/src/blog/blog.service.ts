import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { deleteReplacedMedia } from '../common/media-replace';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { ListBlogPostsQueryDto } from './dto/list-blog-posts-query.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

const BLOG_POST_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  category: true,
  publishedAt: true,
  readTimeMinutes: true,
  coverImageUrl: true,
  featured: true,
  intro: true,
  sections: true,
  takeaway: true,
  isPublished: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BlogPostSelect;

function extractSectionImageUrls(sections: unknown): string[] {
  if (!Array.isArray(sections)) return [];
  const urls = new Set<string>();
  const markdownImage =
    /!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/g;

  for (const item of sections) {
    if (!item || typeof item !== 'object') continue;
    const record = item as { imageUrl?: unknown; body?: unknown };

    if (typeof record.imageUrl === 'string' && record.imageUrl.trim()) {
      urls.add(record.imageUrl.trim());
    }

    if (typeof record.body === 'string') {
      let match: RegExpExecArray | null;
      const pattern = new RegExp(markdownImage.source, 'g');
      while ((match = pattern.exec(record.body)) !== null) {
        urls.add(match[1]);
      }
    }
  }

  return [...urls];
}

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  list(query: ListBlogPostsQueryDto) {
    const where: Prisma.BlogPostWhereInput = {};

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

    return this.prisma.blogPost.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      select: BLOG_POST_SELECT,
    });
  }

  async findBySlug(slug: string, publishedOnly = true) {
    const blogPost = await this.prisma.blogPost.findUnique({
      where: { slug },
      select: BLOG_POST_SELECT,
    });

    if (!blogPost || (publishedOnly && !blogPost.isPublished)) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return blogPost;
  }

  async create(dto: CreateBlogPostDto) {
    try {
      return await this.prisma.blogPost.create({
        data: {
          slug: dto.slug,
          title: dto.title,
          excerpt: dto.excerpt,
          category: dto.category,
          publishedAt: new Date(dto.publishedAt),
          readTimeMinutes: dto.readTimeMinutes,
          coverImageUrl: dto.coverImageUrl,
          featured: dto.featured ?? false,
          intro: dto.intro,
          sections: dto.sections as unknown as Prisma.InputJsonValue,
          takeaway: dto.takeaway,
          sortOrder: dto.sortOrder ?? 0,
          isPublished: dto.isPublished ?? true,
        },
        select: BLOG_POST_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Slug bài viết đã tồn tại');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, coverImageUrl: true, sections: true },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    const nextCoverUrl = dto.coverImageUrl;
    const previousSectionUrls = extractSectionImageUrls(existing.sections);

    try {
      const blogPost = await this.prisma.blogPost.update({
        where: { id },
        data: {
          ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt } : {}),
          ...(dto.category !== undefined ? { category: dto.category } : {}),
          ...(dto.publishedAt !== undefined
            ? { publishedAt: new Date(dto.publishedAt) }
            : {}),
          ...(dto.readTimeMinutes !== undefined
            ? { readTimeMinutes: dto.readTimeMinutes }
            : {}),
          ...(dto.coverImageUrl !== undefined
            ? { coverImageUrl: dto.coverImageUrl }
            : {}),
          ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
          ...(dto.intro !== undefined ? { intro: dto.intro } : {}),
          ...(dto.sections !== undefined
            ? { sections: dto.sections as unknown as Prisma.InputJsonValue }
            : {}),
          ...(dto.takeaway !== undefined ? { takeaway: dto.takeaway } : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
          ...(dto.isPublished !== undefined
            ? { isPublished: dto.isPublished }
            : {}),
        },
        select: BLOG_POST_SELECT,
      });

      await deleteReplacedMedia(
        this.cloudinaryService,
        existing.coverImageUrl,
        nextCoverUrl,
      );

      if (dto.sections !== undefined) {
        const nextSectionUrls = new Set(extractSectionImageUrls(dto.sections));
        await Promise.all(
          previousSectionUrls
            .filter((url) => !nextSectionUrls.has(url))
            .map((url) => this.cloudinaryService.deleteImageByUrl(url)),
        );
      }

      return blogPost;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Slug bài viết đã tồn tại');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, coverImageUrl: true, sections: true },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    await this.prisma.blogPost.delete({ where: { id } });
    await this.cloudinaryService.deleteImageByUrl(existing.coverImageUrl);
    await Promise.all(
      extractSectionImageUrls(existing.sections).map((url) =>
        this.cloudinaryService.deleteImageByUrl(url),
      ),
    );

    return { message: 'Đã xóa bài viết và ảnh Cloudinary (nếu có)' };
  }
}
