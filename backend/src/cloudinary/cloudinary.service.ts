import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { inflateRawSync } from 'zlib';

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

  /** Upload a Listening audio file. Cloudinary stores audio as 'video'. */
  async uploadAudio(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File âm thanh không hợp lệ');
    }
    if (!file.mimetype.startsWith('audio/')) {
      throw new BadRequestException('Chỉ chấp nhận file âm thanh (MP3, M4A, WAV...)');
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'dks-english-center/exam/audio',
          resource_type: 'video', // Cloudinary treats audio as video
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

  private static readonly CAREER_CV_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]);

  /** Upload CV/portfolio (PDF / Word) as Cloudinary raw asset. */
  async uploadCareerCv(file: Express.Multer.File): Promise<UploadApiResponse> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File CV không hợp lệ');
    }

    const mime = file.mimetype?.toLowerCase() ?? '';
    const name = file.originalname?.toLowerCase() ?? '';
    const byExt =
      name.endsWith('.pdf') ||
      name.endsWith('.doc') ||
      name.endsWith('.docx');
    if (!CloudinaryService.CAREER_CV_MIME.has(mime) && !byExt) {
      throw new BadRequestException(
        'Chỉ chấp nhận CV định dạng PDF hoặc Word (.pdf, .doc, .docx)',
      );
    }

    const folder = CLOUDINARY_FOLDERS.careerCvs;
    const ext = name.endsWith('.docx')
      ? 'docx'
      : name.endsWith('.doc')
        ? 'doc'
        : mime.includes('wordprocessingml')
          ? 'docx'
          : mime === 'application/msword'
            ? 'doc'
            : 'pdf';
    const safeBase = (file.originalname || 'cv')
      .replace(/\.[^.]+$/, '')
      .replace(/[^\w.-]+/g, '-')
      .slice(0, 60);
    // Raw public_id PHẢI kèm extension — không thì URL mất MIME → browser tải file “dị”.
    const publicId = `${safeBase}-${Date.now()}.${ext}`;

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'raw',
          overwrite: false,
          use_filename: false,
          unique_filename: false,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Upload CV lên Cloudinary thất bại'));
            return;
          }
          resolve(result);
        },
      );
      upload.end(file.buffer);
    });
  }

  /**
   * public_id raw (CV) — GIỮ extension trong public_id.
   * Khác image: raw upload của ta luôn nhúng .pdf/.doc/.docx vào public_id.
   */
  extractRawPublicId(url: string | null | undefined): string | null {
    if (!url) return null;

    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes('res.cloudinary.com')) return null;

      // Bỏ transformation (fl_attachment:...) nếu có — lấy path sau /upload/
      const pathname = decodeURIComponent(parsed.pathname);
      const folder = CLOUDINARY_FOLDERS.careerCvs;
      const folderPrefix = `${folder}/`;
      const nestedIdx = pathname.indexOf(folderPrefix);
      if (nestedIdx === -1) return null;

      const publicId = pathname.slice(nestedIdx);
      return publicId || null;
    } catch {
      return null;
    }
  }

  /**
   * Account Cloudinary đang chặn delivery PDF/raw (401 deny/ACL).
   * Tải qua Admin generate_archive (signed) rồi bung file trong zip.
   */
  async fetchRawBytes(url: string): Promise<Buffer> {
    const publicId = this.extractRawPublicId(url);
    if (!publicId) {
      throw new BadRequestException('URL CV Cloudinary không hợp lệ');
    }

    const archiveUrl = cloudinary.utils.download_archive_url({
      resource_type: 'raw',
      type: 'upload',
      public_ids: [publicId],
      target_format: 'zip',
      flatten_folders: true,
      expires_at: Math.floor(Date.now() / 1000) + 300,
    });

    const response = await fetch(archiveUrl);
    if (!response.ok) {
      this.logger.warn(
        `Cloudinary archive CV thất bại (${publicId}): HTTP ${response.status}`,
      );
      throw new BadRequestException('Không tải được file CV từ Cloudinary');
    }

    const zip = Buffer.from(await response.arrayBuffer());
    try {
      return CloudinaryService.extractFirstZipEntry(zip);
    } catch (error) {
      this.logger.warn(
        `Giải nén CV thất bại (${publicId}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new BadRequestException('Không đọc được file CV từ Cloudinary');
    }
  }

  /** Bung entry đầu trong zip đơn giản (Cloudinary generate_archive). */
  private static extractFirstZipEntry(zip: Buffer): Buffer {
    let eocd = -1;
    for (let i = zip.length - 22; i >= 0; i -= 1) {
      if (zip.readUInt32LE(i) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) throw new Error('ZIP EOCD không hợp lệ');

    const cdOffset = zip.readUInt32LE(eocd + 16);
    if (zip.readUInt32LE(cdOffset) !== 0x02014b50) {
      throw new Error('ZIP central directory không hợp lệ');
    }

    const method = zip.readUInt16LE(cdOffset + 10);
    const compSize = zip.readUInt32LE(cdOffset + 20);
    const localHeaderOffset = zip.readUInt32LE(cdOffset + 42);

    if (zip.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
      throw new Error('ZIP local header không hợp lệ');
    }
    const lhNameLen = zip.readUInt16LE(localHeaderOffset + 26);
    const lhExtraLen = zip.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + lhNameLen + lhExtraLen;
    const compressed = zip.subarray(dataStart, dataStart + compSize);

    if (method === 0) return Buffer.from(compressed);
    if (method === 8) return inflateRawSync(compressed);
    throw new Error(`ZIP compression method ${method} không hỗ trợ`);
  }

  async deleteRawByUrl(url: string | null | undefined): Promise<boolean> {
    const publicId = this.extractRawPublicId(url);
    if (!publicId) return false;
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
        invalidate: true,
      });
      return result.result === 'ok' || result.result === 'not found';
    } catch (error) {
      this.logger.warn(
        `Xóa CV Cloudinary thất bại (${publicId}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }

  private managedFolders() {
    return [
      CLOUDINARY_FOLDERS.courses,
      CLOUDINARY_FOLDERS.blog,
      CLOUDINARY_FOLDERS.homeGallery,
      CLOUDINARY_FOLDERS.aboutFacilities,
      CLOUDINARY_FOLDERS.aboutVision,
      CLOUDINARY_FOLDERS.aboutTeachers,
      CLOUDINARY_FOLDERS.tuitionProofs,
      CLOUDINARY_FOLDERS.careerCvs,
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
