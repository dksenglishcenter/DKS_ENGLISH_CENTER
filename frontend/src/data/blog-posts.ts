export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageId: string;
  publishedAt: string;
  content: string;
};

/** Dữ liệu tạm — dev sau thay bằng fetch API / CMS. */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "lo-trinh-ielts-band-7",
    title: "Lộ Trình IELTS Band 7 Trong 6 Tháng",
    excerpt:
      "Gợi ý chia giai đoạn Listening–Reading–Writing–Speaking phù hợp học viên đi làm bận rộn.",
    coverImageId: "1434030216411-0b793f4b4173",
    publishedAt: "2026-03-01",
    content:
      "Bài viết mẫu cho khung ISR. Dev sau: thay nội dung bằng markdown hoặc API backend.\n\nGiai đoạn 1 (tháng 1–2): nền tảng ngữ pháp và từ vựng học thuật.\nGiai đoạn 2 (tháng 3–4): luyện đề có giới hạn thời gian.\nGiai đoạn 3 (tháng 5–6): mock test full và tinh chỉnh chiến thuật làm bài.",
  },
  {
    slug: "meo-luyen-noi-tai-nha",
    title: "5 Mẹo Luyện Nói Tiếng Anh Tại Nhà",
    excerpt:
      "Shadowing, ghi âm và học theo chủ đề giúp tăng phản xạ giao tiếp mà không cần ra lớp mỗi ngày.",
    coverImageId: "1529400971008-f566de0e6dfc",
    publishedAt: "2026-02-15",
    content:
      "Bài viết mẫu cho khung ISR.\n\n1. Shadowing 10 phút mỗi sáng.\n2. Ghi âm và tự chấm phát âm.\n3. Học theo chủ đề thay vì học từ lẻ tẻ.\n4. Tìm partner online 2 buổi/tuần.\n5. Ôn lại cụm từ đã dùng cuối tuần.",
  },
];
