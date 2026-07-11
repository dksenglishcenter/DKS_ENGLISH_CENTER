export const CLOUDINARY_ROOT = 'dks-english-center';

export const CLOUDINARY_FOLDERS = {
  brandLogo: `${CLOUDINARY_ROOT}/brand/logo`,
  social: `${CLOUDINARY_ROOT}/social`,
  branches: `${CLOUDINARY_ROOT}/branches`,
} as const;

export const SOCIAL_PLATFORMS = [
  'zalo',
  'facebook',
  'youtube',
  'tiktok',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type MediaCategory = 'brand-logo' | 'social-icon';

export type FolderContext = {
  platform?: SocialPlatform;
  branchId?: string;
};

type FolderResolver = (ctx: FolderContext) => string;

const FOLDER_RESOLVERS: Record<MediaCategory, FolderResolver> = {
  'brand-logo': () => CLOUDINARY_FOLDERS.brandLogo,

  'social-icon': (ctx) => {
    if (!ctx.platform || !SOCIAL_PLATFORMS.includes(ctx.platform)) {
      throw new Error(
        `platform bắt buộc khi category=social-icon (${SOCIAL_PLATFORMS.join(', ')})`,
      );
    }
    return `${CLOUDINARY_FOLDERS.social}/${ctx.platform}`;
  },
};

export function resolveCloudinaryFolder(
  category: MediaCategory,
  platform?: SocialPlatform,
): string {
  const resolver = FOLDER_RESOLVERS[category];

  if (!resolver) {
    throw new Error(`Category không hỗ trợ: ${category}`);
  }

  return resolver({ platform });
}
