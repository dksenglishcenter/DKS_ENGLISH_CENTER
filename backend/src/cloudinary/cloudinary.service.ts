import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({ secure: true });
  }

  async ping(): Promise<{ status: string; cloudName: string }> {
    const result = await cloudinary.api.ping();
    return {
      status: result.status,
      cloudName: cloudinary.config().cloud_name ?? '',
    };
  }
}
