import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
// TODO(email): bật lại khi CareersService gửi notify mail
// import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';

@Module({
  imports: [PrismaModule, AuthModule /* , MailModule */],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareersModule {}
