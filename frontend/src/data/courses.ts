export type Course = {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  target: string;
  tuition: string;
  imgId: string;
  accent: string;
  bg: string;
  icon: string;
  desc: string;
  perks: string[];
};

export const COURSES: Course[] = [
  {
    id: "grade-10",
    title: "Luyện Thi Vào Lớp 10",
    subtitle: "Ôn thi lớp 9 lên lớp 10 THPT",
    level: "Học sinh lớp 9",
    target: "Kỳ thi tuyển sinh lớp 10",
    tuition: "120.000 ₫/buổi",
    imgId: "1523240795612-9a054b0db644",
    accent: "#FFA200",
    bg: "#FFFBF0",
    icon: "🥇",
    desc: "Chương trình hệ thống kiến thức, củng cố ngữ pháp, mở rộng từ vựng và rèn kỹ năng làm bài thi vào lớp 10.",
    perks: ["Bám sát chương trình Bộ Giáo dục", "Lớp sĩ số nhỏ, theo sát học sinh", "Luyện đề và chữa bài chi tiết", "Ưu đãi đến hết tháng 08/2026"],
  },
  {
    id: "thpt-university",
    title: "Luyện Thi Đại Học & THPT",
    subtitle: "Ôn thi tốt nghiệp và xét tuyển Đại học",
    level: "Học sinh lớp 12",
    target: "Tốt nghiệp THPT · Đại học",
    tuition: "150.000 ₫/buổi",
    imgId: "1522202176988-66273c2fd55f",
    accent: "#C0470F",
    bg: "#FFF7F3",
    icon: "🎓",
    desc: "Khóa học củng cố kiến thức, luyện đề chuyên sâu và rèn chiến lược làm bài cho kỳ thi tốt nghiệp THPT và xét tuyển Đại học.",
    perks: ["Bám sát cấu trúc đề thi Bộ Giáo dục", "Giáo viên giàu kinh nghiệm luyện thi", "Lớp sĩ số nhỏ", "Lộ trình ôn tập khoa học"],
  },
  {
    id: "ielts",
    title: "IELTS 1-1",
    subtitle: "Luyện thi IELTS đảm bảo đầu ra",
    level: "A1 – C1",
    target: "IELTS 5.0 – 7.0+",
    tuition: "300.000 – 500.000 ₫/buổi",
    imgId: "1434030216411-0b793f4b4173",
    accent: "#F16522",
    bg: "#FFF4EC",
    icon: "🎯",
    desc: "Khóa học 1 kèm 1 được thiết kế riêng theo trình độ, mục tiêu điểm số và tiến độ của từng học viên.",
    perks: ["Lộ trình cá nhân hóa sau kiểm tra đầu vào", "120 phút/buổi, 2–3 buổi/tuần", "Thi thử và báo cáo tiến độ định kỳ", "Cam kết đầu ra theo lộ trình"],
  },
  {
    id: "global-success",
    title: "Global Success Lớp 1–9",
    subtitle: "Tiếng Anh theo chương trình Bộ Giáo dục",
    level: "Lớp 1–9 · Pre-A1 – B1+",
    target: "Phát triển toàn diện 4 kỹ năng",
    tuition: "Liên hệ tư vấn",
    imgId: "1529400971008-f566de0e6dfc",
    accent: "#E95E1F",
    bg: "#FFF0EB",
    icon: "📚",
    desc: "Chương trình tiếng Anh từ lớp 1 đến lớp 9, phát triển theo lộ trình CEFR và bám sát bộ sách Global Success.",
    perks: ["Bao phủ lộ trình từ lớp 1 đến lớp 9", "Phát triển Nghe · Nói · Đọc · Viết", "Đánh giá học thuật định kỳ", "Nền tảng cho kỳ thi vào lớp 10"],
  },
];
