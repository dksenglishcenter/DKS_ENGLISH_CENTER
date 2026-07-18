export const CLOUDINARY_ROOT = 'dks-english-center';

export const CLOUDINARY_FOLDERS = {
  brandLogo: `${CLOUDINARY_ROOT}/brand/logo`,
  social: `${CLOUDINARY_ROOT}/social`,
  homeGallery: `${CLOUDINARY_ROOT}/home/gallery`,
  aboutFacilities: `${CLOUDINARY_ROOT}/about/facilities`,
  aboutVision: `${CLOUDINARY_ROOT}/about/vision`,
  aboutTeachers: `${CLOUDINARY_ROOT}/about/teachers`,
  courses: `${CLOUDINARY_ROOT}/courses`,
  blog: `${CLOUDINARY_ROOT}/blog`,
  branches: `${CLOUDINARY_ROOT}/branches`,
} as const;

export const SOCIAL_PLATFORMS = [
  'zalo',
  'facebook',
  'youtube',
  'tiktok',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type MediaCategory =
  | 'brand-logo'
  | 'social-icon'
  | 'home-gallery'
  | 'about-facilities'
  | 'about-vision'
  | 'about-teacher'
  | 'course-cover'
  | 'blog-cover'
  | 'blog-section';

export const MEDIA_CATEGORIES: MediaCategory[] = [
  'brand-logo',
  'social-icon',
  'home-gallery',
  'about-facilities',
  'about-vision',
  'about-teacher',
  'course-cover',
  'blog-cover',
  'blog-section',
];

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

  'home-gallery': () => CLOUDINARY_FOLDERS.homeGallery,

  'about-facilities': () => CLOUDINARY_FOLDERS.aboutFacilities,

  'about-vision': () => CLOUDINARY_FOLDERS.aboutVision,

  'about-teacher': () => CLOUDINARY_FOLDERS.aboutTeachers,

  'course-cover': () => CLOUDINARY_FOLDERS.courses,

  'blog-cover': () => CLOUDINARY_FOLDERS.blog,

  'blog-section': () => CLOUDINARY_FOLDERS.blog,
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
