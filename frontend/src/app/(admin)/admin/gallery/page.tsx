import { GalleryImagesAdmin } from "@/components/admin/gallery-images-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Môi trường học tập",
  description: "Quản lý gallery ảnh trang chủ DKS.",
  path: "/admin/gallery",
  noIndex: true,
});

export default function AdminGalleryPage() {
  return <GalleryImagesAdmin />;
}
