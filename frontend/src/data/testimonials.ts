export type Testimonial = {
  name: string;
  course: string;
  badge: string;
  text: string;
  stars: number;
  avatar: string;
};

export const TESTIMONIALS: Testimonial[] = [
  { name: "Nguyễn Thị Mai", course: "IELTS Preparation", badge: "IELTS 7.0 ↑ từ 5.0", text: "Sau 6 tháng học tại DKS, điểm IELTS của tôi từ 5.0 đã lên 7.0. Giáo viên rất tận tâm và phương pháp dạy hiệu quả. Các buổi mock test giúp tôi quen áp lực thi thật rất nhiều.", stars: 5, avatar: "MT" },
  { name: "Trần Văn Hùng", course: "9-to-10 Prep", badge: "9.5 điểm vào 10 chuyên", text: "DKS đã giúp con trai tôi đạt 9.5 điểm thi vào lớp 10 chuyên. Giáo viên không chỉ dạy kiến thức mà còn truyền cảm hứng học tập. Rất biết ơn trung tâm!", stars: 5, avatar: "HT" },
  { name: "Phạm Thị Linh", course: "Communicative English", badge: "Tự tin giao tiếp công việc", text: "Tôi đã từng rất sợ nói tiếng Anh nhưng sau 3 tháng tại DKS, tôi có thể tự tin trình bày trước khách hàng nước ngoài. Lớp nhỏ giúp tôi được thực hành nhiều hơn.", stars: 5, avatar: "LP" },
];
