import type { ApiResponse } from "@/lib/api/client";

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

export type ContactFormReceipt = {
  id: string;
  createdAt: string;
};

export type ContactFormResponse = ApiResponse<ContactFormReceipt, never, true>;

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

export type ContactSubmissionsResponse = ApiResponse<
  ContactSubmission[],
  ContactSubmissionsMeta
>;

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

export type ContactInformationResponse = ApiResponse<ContactInformation>;
