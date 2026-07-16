import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ContactInformationController } from './contact-information.controller';
import { ContactInformationService } from './contact-information.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ContactInformationController],
  providers: [ContactInformationService],
})
export class ContactInformationModule {}
