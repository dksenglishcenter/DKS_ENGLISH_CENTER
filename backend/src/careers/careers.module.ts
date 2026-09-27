import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareersModule {}
