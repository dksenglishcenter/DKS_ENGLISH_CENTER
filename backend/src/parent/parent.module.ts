import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [ParentController],
  providers: [ParentService],
})
export class ParentModule {}
