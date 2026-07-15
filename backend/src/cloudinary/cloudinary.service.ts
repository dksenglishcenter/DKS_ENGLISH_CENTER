import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

import {
  CLOUDINARY_FOLDERS,
  CLOUDINARY_ROOT,
  resolveCloudinaryFolder,
  type MediaCategory,
  type SocialPlatform,
} from './cloudinary.constants';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

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

  /**
   * Lấy public_id ảnh quản lý từ URL Cloudinary (courses / home gallery).
   * Unsplash / URL ngoài → null (không xóa).
   */
  extractManagedPublicId(url: string | null | undefined): string | null {
    if (!url) return null;

    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes('res.cloudinary.com')) return null;

      const folders = [
        CLOUDINARY_FOLDERS.courses,
        CLOUDINARY_FOLDERS.homeGallery,
        CLOUDINARY_FOLDERS.aboutFacilities,
        CLOUDINARY_FOLDERS.aboutVision,
        CLOUDINARY_FOLDERS.aboutTeachers,
      ];

      for (const folder of folders) {
        const folderPrefix = `${folder}/`;
        const folderIdx = parsed.pathname.indexOf(folderPrefix);
        if (folderIdx === -1) continue;

        let publicId = parsed.pathname.slice(folderIdx);
        publicId = decodeURIComponent(publicId).replace(/\.[a-zA-Z0-9]+$/, '');
        return publicId || null;
      }

      return null;
    } catch {
      return null;
    }
  }

  /** @deprecated dùng extractManagedPublicId */
  extractCourseCoverPublicId(url: string | null | undefined): string | null {
    return this.extractManagedPublicId(url);
  }

  async deleteImageByUrl(url: string | null | undefined): Promise<boolean> {
    const publicId = this.extractManagedPublicId(url);
    if (!publicId) return false;
    return this.deleteImageByPublicId(publicId);
  }

  async deleteImageByPublicId(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      });
      return result.result === 'ok' || result.result === 'not found';
    } catch (error) {
      this.logger.warn(
        `Xóa Cloudinary thất bại (${publicId}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }

  /**
   * Đưa ảnh sang _stash trong cùng folder (ẩn khỏi gallery chính)
   * để có thể restore nếu user Hủy form.
   */
  async stashManagedImage(url: string): Promise<{
    originalPublicId: string;
    stashPublicId: string;
    stashUrl: string;
  } | null> {
    const originalPublicId = this.extractManagedPublicId(url);
    if (!originalPublicId) return null;

    const leaf = originalPublicId.split('/').pop();
    if (!leaf) return null;

    const folder = originalPublicId.slice(0, originalPublicId.length - leaf.length - 1);
    const stashPublicId = `${folder}/_stash/${leaf}_${Date.now()}`;

    try {
      const result = await cloudinary.uploader.rename(
        originalPublicId,
        stashPublicId,
        { overwrite: true, invalidate: true },
      );
      return {
        originalPublicId,
        stashPublicId: result.public_id,
        stashUrl: result.secure_url,
      };
    } catch (error) {
      this.logger.warn(
        `Stash Cloudinary thất bại (${originalPublicId}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  async restoreStashedImage(
    stashPublicId: string,
    originalPublicId: string,
  ): Promise<{ url: string; publicId: string } | null> {
    const allowed =
      (stashPublicId.startsWith(`${CLOUDINARY_ROOT}/`) &&
        originalPublicId.startsWith(`${CLOUDINARY_ROOT}/`) &&
        (stashPublicId.includes('/courses/') ||
          stashPublicId.includes('/home/gallery/') ||
          stashPublicId.includes('/about/facilities/') ||
          stashPublicId.includes('/about/vision/') ||
          stashPublicId.includes('/about/teachers/'))) &&
      (originalPublicId.startsWith(`${CLOUDINARY_FOLDERS.courses}/`) ||
        originalPublicId.startsWith(`${CLOUDINARY_FOLDERS.homeGallery}/`) ||
        originalPublicId.startsWith(`${CLOUDINARY_FOLDERS.aboutFacilities}/`) ||
        originalPublicId.startsWith(`${CLOUDINARY_FOLDERS.aboutVision}/`) ||
        originalPublicId.startsWith(`${CLOUDINARY_FOLDERS.aboutTeachers}/`));

    if (!allowed || !stashPublicId.includes('/_stash/')) {
      return null;
    }

    try {
      const result = await cloudinary.uploader.rename(
        stashPublicId,
        originalPublicId,
        { overwrite: true, invalidate: true },
      );
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      this.logger.warn(
        `Restore Cloudinary thất bại (${stashPublicId}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
