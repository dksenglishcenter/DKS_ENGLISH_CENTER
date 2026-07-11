import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

import {
  resolveCloudinaryFolder,
  type MediaCategory,
  type SocialPlatform,
} from './cloudinary.constants';

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

  async uploadImage(
    file: Express.Multer.File,
    options: {
      category: MediaCategory;
      platform?: SocialPlatform;
      publicId?: string;
    },
  ): Promise<UploadApiResponse> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File ảnh không hợp lệ');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Chỉ chấp nhận file ảnh (PNG, JPG, SVG, WebP...)');
    }

    const folder = resolveCloudinaryFolder(options.category, options.platform);

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: options.publicId,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Upload Cloudinary thất bại'));
            return;
          }
          resolve(result);
        },
      );

      upload.end(file.buffer);
    });
  }
}
