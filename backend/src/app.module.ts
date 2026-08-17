import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AboutContentModule } from './about-content/about-content.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { CareersModule } from './careers/careers.module';
import { ClassesModule } from './classes/classes.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactModule } from './contact/contact.module';
import { ContactInformationModule } from './contact-information/contact-information.module';
import { CoursesModule } from './courses/courses.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FacilityImagesModule } from './facility-images/facility-images.module';
import { GalleryImagesModule } from './gallery-images/gallery-images.module';
import { JobsModule } from './jobs/jobs.module';
import { ParentModule } from './parent/parent.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';
import { SuccessStoriesModule } from './success-stories/success-stories.module';
import { TeachersModule } from './teachers/teachers.module';
import { TuitionModule } from './tuition/tuition.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    ContactModule,
    ContactInformationModule,
    CareersModule,
    AuthModule,
    CoursesModule,
    BlogModule,
    SuccessStoriesModule,
    GalleryImagesModule,
    FacilityImagesModule,
    AboutContentModule,
    TeachersModule,
    JobsModule,
    DashboardModule,
    UsersModule,
    StudentsModule,
    ClassesModule,
    AttendanceModule,
    TuitionModule,
    ParentModule,
    // Global default: 200 requests/min/IP. Sensitive routes override via @Throttle.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 200 }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
