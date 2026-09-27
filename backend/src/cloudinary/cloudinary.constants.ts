export const CLOUDINARY_ROOT = 'dks-english-center';

export const CLOUDINARY_FOLDERS = {
  brandLogo: `${CLOUDINARY_ROOT}/brand/logo`,
  social: `${CLOUDINARY_ROOT}/social`,
  homeGallery: `${CLOUDINARY_ROOT}/home/gallery`,
  eventPhotos: `${CLOUDINARY_ROOT}/events/photos`,
  successStories: `${CLOUDINARY_ROOT}/success-stories`,
  aboutFacilities: `${CLOUDINARY_ROOT}/about/facilities`,
  aboutVision: `${CLOUDINARY_ROOT}/about/vision`,
  aboutTeachers: `${CLOUDINARY_ROOT}/about/teachers`,
  courses: `${CLOUDINARY_ROOT}/courses`,
  blog: `${CLOUDINARY_ROOT}/blog`,
  tuitionProofs: `${CLOUDINARY_ROOT}/tuition/proofs`,
  careerCvs: `${CLOUDINARY_ROOT}/careers/cv`,
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
  | 'event-photo'
  | 'success-story'
  | 'about-facilities'
  | 'about-vision'
  | 'about-teacher'
  | 'course-cover'
  | 'blog-cover'
  | 'blog-section'
  | 'tuition-proof'
  | 'career-cv';

export const MEDIA_CATEGORIES: MediaCategory[] = [
  'brand-logo',
  'social-icon',
  'home-gallery',
  'event-photo',
  'success-story',
  'about-facilities',
  'about-vision',
  'about-teacher',
  'course-cover',
  'blog-cover',
  'blog-section',
  'tuition-proof',
  'career-cv',
];

export type FolderContext = {
  platform?: SocialPlatform;
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

  'event-photo': () => CLOUDINARY_FOLDERS.eventPhotos,

  'success-story': () => CLOUDINARY_FOLDERS.successStories,

  'about-facilities': () => CLOUDINARY_FOLDERS.aboutFacilities,

  'about-vision': () => CLOUDINARY_FOLDERS.aboutVision,

  'about-teacher': () => CLOUDINARY_FOLDERS.aboutTeachers,

  'course-cover': () => CLOUDINARY_FOLDERS.courses,

  'blog-cover': () => CLOUDINARY_FOLDERS.blog,

  'blog-section': () => CLOUDINARY_FOLDERS.blog,

  'tuition-proof': () => CLOUDINARY_FOLDERS.tuitionProofs,

  'career-cv': () => CLOUDINARY_FOLDERS.careerCvs,
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
