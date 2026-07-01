import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('health')
  async getHealth() {
    try {
      const result = await this.cloudinaryService.ping();
      return {
        status: 'ok',
        cloudinary: result,
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException('Cloudinary connection failed');
    }
  }
}
