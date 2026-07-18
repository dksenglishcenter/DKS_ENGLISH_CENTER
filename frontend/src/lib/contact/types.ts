import type { ApiResponse } from "@/lib/api/client";

export type ContactFormPayload = {
  fullName: string;
  phone: string;
  email?: string;
  courseInterest: string;
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
