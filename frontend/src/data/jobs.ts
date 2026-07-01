export type Job = {
  id: number;
  title: string;
  type: string;
  location: string;
  salary: string;
  duties: string[];
  benefits: string[];
  req: string;
};

export const JOBS: Job[] = [
  {
    id: 1,
    title: "Giáo Viên Tiếng Anh IELTS",
    type: "Full-time / Part-time",
    location: "TP. Hồ Chí Minh",
    salary: "15 – 30 triệu / tháng",
    duties: ["Giảng dạy khóa IELTS từ band 5.5 – 8.0", "Thiết kế giáo án và tài liệu học tập phù hợp", "Chấm bài và phản hồi chi tiết cho học viên", "Tham gia mock test và buổi luyện nhóm hàng tuần", "Báo cáo tiến độ học viên cho Trưởng bộ môn"],
    benefits: ["Lương cạnh tranh + thưởng theo kết quả học viên", "BHXH đầy đủ và nghỉ phép có lương", "Đào tạo chuyên môn liên tục", "Môi trường trẻ trung, năng động, sáng tạo", "Cơ hội thăng tiến lên Trưởng bộ môn"],
    req: "IELTS 7.5+ hoặc tương đương · Kinh nghiệm giảng dạy từ 1 năm",
  },
  {
    id: 2,
    title: "Tư Vấn Tuyển Sinh",
    type: "Full-time",
    location: "TP. Hồ Chí Minh",
    salary: "8 – 15 triệu + hoa hồng",
    duties: ["Tư vấn và giới thiệu chương trình học phù hợp", "Tiếp nhận và xử lý thông tin học viên tiềm năng", "Chăm sóc và duy trì mối quan hệ với học viên hiện tại", "Hỗ trợ các sự kiện marketing và open house", "Đạt KPI tuyển sinh hàng tháng theo mục tiêu"],
    benefits: ["Lương cứng hấp dẫn + hoa hồng không giới hạn", "Đào tạo kỹ năng bán hàng và tư vấn chuyên nghiệp", "Môi trường giáo dục tích cực, ý nghĩa", "Team building và du lịch công ty hàng năm", "Lộ trình lên Trưởng phòng Tuyển sinh rõ ràng"],
    req: "Tốt nghiệp ĐH · Tiếng Anh giao tiếp tốt · Kỹ năng thuyết phục",
  },
  {
    id: 3,
    title: "Gia Sư 1-1 (Freelance)",
    type: "Freelance / Part-time",
    location: "Online & Offline",
    salary: "300 – 600K / giờ",
    duties: ["Dạy kèm 1-1 theo lộ trình cá nhân hóa cho học viên", "Chuẩn bị bài giảng và tài liệu riêng phù hợp mục tiêu", "Đánh giá tiến độ và điều chỉnh phương pháp linh hoạt", "Giao tiếp thường xuyên với phụ huynh về kết quả học", "Báo cáo tiến độ học viên cho trung tâm hàng tháng"],
    benefits: ["Thời gian làm việc linh hoạt hoàn toàn", "Thù lao hấp dẫn, tăng theo kinh nghiệm và năng lực", "Được hỗ trợ tài liệu dạy học từ thư viện DKS", "Kết nối mạng lưới giáo viên chuyên nghiệp DKS", "Tham gia chương trình đào tạo nghiệp vụ DKS miễn phí"],
    req: "Trình độ C1+ · Kinh nghiệm dạy kèm · Nhiệt tình, kiên nhẫn",
  },
];
