import { Injectable } from '@nestjs/common';

import { Role } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const MAX_GALLERY_IMAGES = 6;
const MAX_FACILITY_IMAGES = 6;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      coursesTotal,
      coursesPublished,
      coursesFeatured,
      storiesTotal,
      storiesPublished,
      galleryTotal,
      galleryPublished,
      facilitiesTotal,
      facilitiesPublished,
      teachersTotal,
      teachersPublished,
      blogTotal,
      blogPublished,
      blogFeatured,
      contactsTotal,
      contactsLast7Days,
      careersTotal,
      careersLast7Days,
      usersTotal,
      usersAdmin,
      about,
    ] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { isPublished: true } }),
      this.prisma.course.count({ where: { featured: true } }),
      this.prisma.successStory.count(),
      this.prisma.successStory.count({ where: { isPublished: true } }),
      this.prisma.galleryImage.count(),
      this.prisma.galleryImage.count({ where: { isPublished: true } }),
      this.prisma.facilityImage.count(),
      this.prisma.facilityImage.count({ where: { isPublished: true } }),
      this.prisma.teacher.count(),
      this.prisma.teacher.count({ where: { isPublished: true } }),
      this.prisma.blogPost.count(),
      this.prisma.blogPost.count({ where: { isPublished: true } }),
      this.prisma.blogPost.count({ where: { featured: true } }),
      this.prisma.contactSubmission.count(),
      this.prisma.contactSubmission.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      this.prisma.careerApplication.count(),
      this.prisma.careerApplication.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.aboutPageContent.findUnique({
        where: { id: 'about' },
        select: { visionImageUrl: true },
      }),
    ]);

    return {
      courses: {
        total: coursesTotal,
        published: coursesPublished,
        featured: coursesFeatured,
        draft: coursesTotal - coursesPublished,
      },
      successStories: {
        total: storiesTotal,
        published: storiesPublished,
      },
      gallery: {
        total: galleryTotal,
        published: galleryPublished,
        max: MAX_GALLERY_IMAGES,
      },
      facilities: {
        total: facilitiesTotal,
        published: facilitiesPublished,
        max: MAX_FACILITY_IMAGES,
      },
      about: {
        hasVisionImage: Boolean(about?.visionImageUrl),
      },
      teachers: {
        total: teachersTotal,
        published: teachersPublished,
      },
      blog: {
        total: blogTotal,
        published: blogPublished,
        featured: blogFeatured,
        draft: blogTotal - blogPublished,
      },
      contacts: {
        total: contactsTotal,
        last7Days: contactsLast7Days,
      },
      careers: {
        total: careersTotal,
        last7Days: careersLast7Days,
      },
      users: {
        total: usersTotal,
        admins: usersAdmin,
        members: usersTotal - usersAdmin,
      },
    };
  }
}
