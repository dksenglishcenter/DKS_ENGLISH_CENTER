export type GalleryPhoto = {
  id: string;
  alt: string;
  size: "tall" | "normal" | "wide";
};

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { id: "1580582932707-520aed937b7b", alt: "Lớp học hiện đại tại DKS", size: "tall" },
  { id: "1522202176988-66273c2fd55f", alt: "Học viên luyện thi IELTS", size: "normal" },
  { id: "1529400971008-f566de0e6dfc", alt: "Buổi học giao tiếp sôi nổi", size: "normal" },
  { id: "1434030216411-0b793f4b4173", alt: "Phòng học trang bị đầy đủ", size: "wide" },
  { id: "1523240795612-9a054b0db644", alt: "Học sinh luyện thi vào 10", size: "normal" },
  { id: "1481627834876-b7833e8f5570", alt: "Thư viện tài liệu học tập", size: "normal" },
];
