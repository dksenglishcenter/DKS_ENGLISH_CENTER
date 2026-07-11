import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactModule } from './contact/contact.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, ContactModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
