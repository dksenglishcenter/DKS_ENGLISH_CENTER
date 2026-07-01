export type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  cat: string;
  date: string;
  readTime: string;
  imgId: string;
  hot: boolean;
};

export const BLOGS: BlogPost[] = [
  { id: 1, title: "5 Bí Quyết Học IELTS Writing Đạt Band 7.0+", excerpt: "Writing là kỹ năng nhiều thí sinh gặp khó khăn nhất. Bài viết chia sẻ 5 chiến lược giúp bạn cải thiện Writing một cách hệ thống.", cat: "IELTS Tips", date: "15/06/2025", readTime: "8 phút", imgId: "1481627834876-b7833e8f5570", hot: true },
  { id: 2, title: "Cách Phát Âm Tiếng Anh Chuẩn Trong 30 Ngày", excerpt: "Phát âm chuẩn là nền tảng của tiếng Anh tự tin. Kế hoạch 30 ngày này sẽ giúp bạn cải thiện pronunciation một cách bài bản.", cat: "Học Tiếng Anh", date: "10/06/2025", readTime: "6 phút", imgId: "1434030216411-0b793f4b4173", hot: true },
  { id: 3, title: "Top 10 Ứng Dụng Học Tiếng Anh Hiệu Quả 2025", excerpt: "Công nghệ AI đang thay đổi cách chúng ta học ngoại ngữ. Điểm qua 10 ứng dụng tốt nhất giúp bạn luyện tập mọi lúc mọi nơi.", cat: "Công Nghệ", date: "05/06/2025", readTime: "5 phút", imgId: "1522202176988-66273c2fd55f", hot: false },
  { id: 4, title: "Chiến Lược Luyện Thi Tiếng Anh Vào Lớp 10 Hiệu Quả", excerpt: "Kỳ thi vào lớp 10 có thể chinh phục nếu bạn có chiến lược đúng. Bài viết hướng dẫn từng bước chuẩn bị chi tiết.", cat: "Thi Cử", date: "01/06/2025", readTime: "10 phút", imgId: "1580582932707-520aed937b7b", hot: false },
  { id: 5, title: "Lỗi Ngữ Pháp Người Việt Hay Mắc Khi Học Tiếng Anh", excerpt: "Phân tích những lỗi ngữ pháp phổ biến và đưa ra cách khắc phục hiệu quả cho người học tiếng Anh tại Việt Nam.", cat: "Ngữ Pháp", date: "25/05/2025", readTime: "7 phút", imgId: "1529400971008-f566de0e6dfc", hot: false },
  { id: 6, title: "Học Tiếng Anh Cùng Con Từ 3 Tuổi: Nên Hay Không?", excerpt: "Độ tuổi nào phù hợp để bắt đầu học tiếng Anh? Chuyên gia giải đáp và đưa phương pháp tiếp cận phù hợp từng độ tuổi.", cat: "Phụ Huynh", date: "20/05/2025", readTime: "9 phút", imgId: "1580582932707-520aed937b7b", hot: false },
];
