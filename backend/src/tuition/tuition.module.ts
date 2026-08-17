import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TuitionController } from './tuition.controller';
import { TuitionService } from './tuition.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TuitionController],
  providers: [TuitionService],
})
export class TuitionModule {}
