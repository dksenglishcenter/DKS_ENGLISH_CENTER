export type Teacher = {
  name: string;
  title: string;
  cred: string;
  exp: string;
  imgId: string;
  bio: string;
};

export const TEACHERS: Teacher[] = [
  { name: "Ms. Nguyễn Hương", title: "IELTS Specialist", cred: "IELTS 8.5 · CELTA Cambridge", exp: "7 năm kinh nghiệm", imgId: "1573496359142-b8d87734a5a2", bio: "Chuyên gia luyện IELTS với hơn 500 học viên đạt band 7.0+. Tốt nghiệp ĐH Hà Nội, chứng chỉ CELTA Cambridge." },
  { name: "Mr. Trần Minh", title: "Academic English", cred: "CELTA Certified · Cambridge", exp: "8 năm kinh nghiệm", imgId: "1568602471122-7832951cc4c5", bio: "Giáo viên có chứng chỉ CELTA từ Cambridge, chuyên đào tạo tiếng Anh học thuật và chuẩn bị du học." },
  { name: "Ms. Lê Thu Lan", title: "Communication Coach", cred: "MA Applied Linguistics", exp: "6 năm kinh nghiệm", imgId: "1607746882042-944635dfe10e", bio: "Thạc sĩ Ngôn ngữ học ứng dụng, đam mê giúp học viên tự tin giao tiếp trong môi trường quốc tế." },
  { name: "Mr. David Wilson", title: "Native Speaker Coach", cred: "B.A. Education · UK", exp: "4 năm tại Việt Nam", imgId: "1500648767791-00dcc994a43e", bio: "Giáo viên bản ngữ người Anh, mang đến trải nghiệm phát âm và văn hóa Anh ngữ chính thống." },
];
