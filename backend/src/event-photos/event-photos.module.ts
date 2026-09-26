import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EventPhotosController } from './event-photos.controller';
import { EventPhotosService } from './event-photos.service';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [EventPhotosController],
  providers: [EventPhotosService],
  exports: [EventPhotosService],
})
export class EventPhotosModule {}
