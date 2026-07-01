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
    id: "ielts",
    title: "IELTS Preparation",
    subtitle: "Luyện thi IELTS",
    level: "Intermediate – Advanced",
    target: "IELTS 6.5 – 8.0",
    tuition: "3.500.000 ₫/tháng",
    imgId: "1434030216411-0b793f4b4173",
    accent: "#F16522",
    bg: "#FFF4EC",
    icon: "🎯",
    desc: "Chương trình luyện thi IELTS toàn diện, bám sát format thi Cambridge mới nhất.",
    perks: ["4 kỹ năng L · R · W · S", "Giáo viên IELTS 8.0+", "Mock test hàng tuần", "Tài liệu độc quyền DKS"],
  },
  {
    id: "highschool",
    title: "9-to-10 Prep",
    subtitle: "Luyện thi vào 10 & THPT",
    level: "THCS – THPT",
    target: "Điểm 9 – 10",
    tuition: "2.500.000 ₫/tháng",
    imgId: "1523240795612-9a054b0db644",
    accent: "#FFA200",
    bg: "#FFFBF0",
    icon: "📚",
    desc: "Khóa học chuyên biệt bám sát đề thi Bộ GD&ĐT, tối ưu điểm số thi quan trọng.",
    perks: ["Bám cấu trúc đề thi BGD", "Luyện đề thử hàng tháng", "Phân tích từng dạng bài", "Giáo viên luyện thi chuyên"],
  },
  {
    id: "comm",
    title: "Communicative English",
    subtitle: "Tiếng Anh Giao Tiếp",
    level: "Mọi trình độ",
    target: "Tự tin giao tiếp",
    tuition: "2.000.000 ₫/tháng",
    imgId: "1529400971008-f566de0e6dfc",
    accent: "#E95E1F",
    bg: "#FFF0EB",
    icon: "💬",
    desc: "Học tiếng Anh giao tiếp thực tế, tự tin trong công việc và cuộc sống hàng ngày.",
    perks: ["Phát âm chuẩn Anh/Mỹ", "Tình huống giao tiếp thực tế", "Lớp nhỏ 8–12 học viên", "Role-play & Debate"],
  },
  {
    id: "tutoring",
    title: "1-on-1 Tutoring",
    subtitle: "Gia Sư Cá Nhân",
    level: "Mọi mục tiêu",
    target: "Cá nhân hóa 100%",
    tuition: "500.000 ₫/buổi",
    imgId: "1522202176988-66273c2fd55f",
    accent: "#C0470F",
    bg: "#FFF7F3",
    icon: "👩‍🏫",
    desc: "Lộ trình hoàn toàn cá nhân hóa, giáo viên tập trung 100% vào nhu cầu của bạn.",
    perks: ["Lộ trình học riêng biệt", "Thời gian linh hoạt", "GV chuyên biệt theo mục tiêu", "Tiến bộ nhanh ×3"],
  },
];
