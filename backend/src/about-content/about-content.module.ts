import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AboutContentController } from './about-content.controller';
import { AboutContentService } from './about-content.service';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [AboutContentController],
  providers: [AboutContentService],
  exports: [AboutContentService],
})
export class AboutContentModule {}
