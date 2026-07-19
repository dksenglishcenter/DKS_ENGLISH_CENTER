import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  type NestExpressApplication,
} from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  // Truyền ExpressAdapter tường minh — tránh Nest PackageLoader
  // không resolve được @nestjs/platform-express trên Render monorepo/hoisting.
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  // Behind the Render/Vercel proxy: read the real client IP from X-Forwarded-For.
  // Without this every request looks like one IP and rate limiting blocks everyone.
  app.set('trust proxy', 1);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // /health ngoài prefix — Render health check không bị 404 vì mọi route nằm dưới /api.
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 3001);
  // Render cần bind 0.0.0.0 để nhận traffic từ proxy.
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on http://0.0.0.0:${port}/api`);
}
bootstrap();
