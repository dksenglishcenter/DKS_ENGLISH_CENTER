import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GalleryImagesController } from './gallery-images.controller';
import { GalleryImagesService } from './gallery-images.service';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [GalleryImagesController],
  providers: [GalleryImagesService],
  exports: [GalleryImagesService],
})
export class GalleryImagesModule {}
