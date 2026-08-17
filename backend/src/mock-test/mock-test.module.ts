import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MockTestController } from './mock-test.controller';
import { MockTestService } from './mock-test.service';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule],
  controllers: [MockTestController],
  providers: [MockTestService],
  exports: [MockTestService],
})
export class MockTestModule {}
