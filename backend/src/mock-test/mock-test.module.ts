import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MockTestController } from './mock-test.controller';
import { MockTestService } from './mock-test.service';

@Module({
  imports: [PrismaModule],
  controllers: [MockTestController],
  providers: [MockTestService],
  exports: [MockTestService],
})
export class MockTestModule {}
