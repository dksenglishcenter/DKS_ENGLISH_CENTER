import type { CloudinaryService } from '../cloudinary/cloudinary.service';

/** Xóa asset cũ trên Cloudinary khi URL đổi sang giá trị mới. */
export async function deleteReplacedMedia(
  cloudinary: CloudinaryService,
  previousUrl: string | null | undefined,
  nextUrl: string | undefined,
): Promise<void> {
  if (nextUrl === undefined || nextUrl === previousUrl) return;
  await cloudinary.deleteImageByUrl(previousUrl);
}
