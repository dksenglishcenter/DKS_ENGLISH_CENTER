import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FacilityImagesController } from './facility-images.controller';
import { FacilityImagesService } from './facility-images.service';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [FacilityImagesController],
  providers: [FacilityImagesService],
  exports: [FacilityImagesService],
})
export class FacilityImagesModule {}
