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

export type ContactSubmission = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  courseInterest: string;
  learningNeeds: string | null;
  createdAt: string;
};

export type ContactSubmissionsMeta = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type ContactSubmissionsResponse = {
  success: true;
  data: ContactSubmission[];
  meta: ContactSubmissionsMeta;
};

export type ContactInformation = {
  id: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  mapUrl: string;
  updatedAt: string;
};

export type ContactInformationPayload = Pick<
  ContactInformation,
  "phone" | "email" | "address" | "hours" | "mapUrl"
>;

export type ContactInformationResponse = {
  contactInfo: ContactInformation;
};
