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

  private managedFolders() {
    return [
      CLOUDINARY_FOLDERS.courses,
      CLOUDINARY_FOLDERS.blog,
      CLOUDINARY_FOLDERS.homeGallery,
      CLOUDINARY_FOLDERS.aboutFacilities,
      CLOUDINARY_FOLDERS.aboutVision,
      CLOUDINARY_FOLDERS.aboutTeachers,
    ];
  }

  private isManagedPublicId(publicId: string) {
    return this.managedFolders().some(
      (folder) => publicId === folder || publicId.startsWith(`${folder}/`),
    );
  }

  /**
   * Lấy public_id ảnh quản lý từ URL Cloudinary.
   * Unsplash / URL ngoài → null (không xóa).
   * Hỗ trợ cả URL legacy kết thúc đúng bằng folder (vd: .../about/vision).
   */
  extractManagedPublicId(url: string | null | undefined): string | null {
    if (!url) return null;

    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes('res.cloudinary.com')) return null;

      const pathname = decodeURIComponent(parsed.pathname);

      for (const folder of this.managedFolders()) {
        const folderPrefix = `${folder}/`;
        const nestedIdx = pathname.indexOf(folderPrefix);
        if (nestedIdx !== -1) {
          return pathname.slice(nestedIdx).replace(/\.[a-zA-Z0-9]+$/, '') || null;
        }

        // Legacy: public_id trùng đúng folder (không có tên file phía sau)
        const exactIdx = pathname.indexOf(folder);
        if (exactIdx === -1) continue;
        const after = pathname.slice(exactIdx + folder.length);
        if (after === '' || /^\.[a-zA-Z0-9]+$/.test(after)) {
          return folder;
        }
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

    // Legacy URL kết thúc đúng bằng folder → stash trong folder/_stash
    const isExactFolder = this.managedFolders().some(
      (folder) => folder === originalPublicId,
    );
    const stashPublicId = isExactFolder
      ? `${originalPublicId}/_stash/asset_${Date.now()}`
      : (() => {
          const leaf = originalPublicId.split('/').pop();
          if (!leaf) return null;
          const folder = originalPublicId.slice(
            0,
            originalPublicId.length - leaf.length - 1,
          );
          return `${folder}/_stash/${leaf}_${Date.now()}`;
        })();
    if (!stashPublicId) return null;

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
      stashPublicId.startsWith(`${CLOUDINARY_ROOT}/`) &&
      stashPublicId.includes('/_stash/') &&
      this.isManagedPublicId(originalPublicId);

    if (!allowed) {
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
