import { Injectable } from '@nestjs/common';

import {
  ClassStatus,
  InvoiceStatus,
  Role,
  StudentStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const MAX_GALLERY_IMAGES = 6;
const MAX_FACILITY_IMAGES = 6;

const TREND_DAYS = 30;
// Vietnam is UTC+7. Bucket timestamps by local day so the chart matches VN dates.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function vnDayKey(date: Date): string {
  return new Date(date.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

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
      studentsStudying,
      classesOpen,
      sessionsLast7Days,
      invoicesUnpaid,
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
      this.prisma.student.count({ where: { status: StudentStatus.STUDYING } }),
      this.prisma.classGroup.count({ where: { status: ClassStatus.OPEN } }),
      this.prisma.classSession.count({ where: { date: { gte: weekAgo } } }),
      this.prisma.tuitionInvoice.count({ where: { status: InvoiceStatus.UNPAID } }),
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
      ops: {
        studentsStudying,
        classesOpen,
        sessionsLast7Days,
        invoicesUnpaid,
      },
      leadsTrend: await this.getLeadsTrend(),
    };
  }

  // Daily count of submissions (contacts + careers) over the last 30 days.
  private async getLeadsTrend(): Promise<{ date: string; count: number }[]> {
    const since = new Date(Date.now() - (TREND_DAYS - 1) * DAY_MS);

    const [contacts, careers] = await Promise.all([
      this.prisma.contactSubmission.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      this.prisma.careerApplication.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
    ]);

    const counts = new Map<string, number>();
    for (const { createdAt } of [...contacts, ...careers]) {
      const key = vnDayKey(createdAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    // Fill every day in the window so the line has no gaps (0 on empty days).
    const todayVnMs = Date.now() + VN_OFFSET_MS;
    const trend: { date: string; count: number }[] = [];
    for (let i = TREND_DAYS - 1; i >= 0; i--) {
      const key = new Date(todayVnMs - i * DAY_MS).toISOString().slice(0, 10);
      trend.push({ date: key, count: counts.get(key) ?? 0 });
    }
    return trend;
  }
}
