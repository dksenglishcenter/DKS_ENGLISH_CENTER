export const CAREER_POSITION_OPTIONS = [
  "Giáo Viên Tiếng Anh IELTS",
  "Tư Vấn Tuyển Sinh",
  "Gia Sư 1-1 (Freelance)",
] as const;

export type CareerPositionOption = (typeof CAREER_POSITION_OPTIONS)[number];

export type CareerApplicationPayload = {
  fullName: string;
  email: string;
  phone: string;
  position: CareerPositionOption;
  introduction?: string;
};

export type CareerApplicationResponse = {
  message: string;
  id: string;
  createdAt: string;
};
