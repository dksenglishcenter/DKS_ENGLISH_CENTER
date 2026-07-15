import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SuccessStoriesController } from './success-stories.controller';
import { SuccessStoriesService } from './success-stories.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SuccessStoriesController],
  providers: [SuccessStoriesService],
  exports: [SuccessStoriesService],
})
export class SuccessStoriesModule {}
