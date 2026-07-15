import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AboutContentModule } from './about-content/about-content.module';
import { AuthModule } from './auth/auth.module';
import { CareersModule } from './careers/careers.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactModule } from './contact/contact.module';
import { CoursesModule } from './courses/courses.module';
import { FacilityImagesModule } from './facility-images/facility-images.module';
import { GalleryImagesModule } from './gallery-images/gallery-images.module';
import { PrismaModule } from './prisma/prisma.module';
import { SuccessStoriesModule } from './success-stories/success-stories.module';
import { TeachersModule } from './teachers/teachers.module';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    ContactModule,
    CareersModule,
    AuthModule,
    CoursesModule,
    SuccessStoriesModule,
    GalleryImagesModule,
    FacilityImagesModule,
    AboutContentModule,
    TeachersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
