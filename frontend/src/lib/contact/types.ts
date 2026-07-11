export const CONTACT_COURSE_OPTIONS = [
  "IELTS Preparation",
  "9-to-10 Prep",
  "Communicative English",
  "1-on-1 Tutoring",
] as const;

export type ContactCourseOption = (typeof CONTACT_COURSE_OPTIONS)[number];

export type ContactFormPayload = {
  fullName: string;
  phone: string;
  email?: string;
  courseInterest: ContactCourseOption;
  learningNeeds?: string;
};

export type ContactFormResponse = {
  message: string;
  id: string;
  createdAt: string;
};
