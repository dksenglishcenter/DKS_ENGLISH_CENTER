import type { ApiResponse } from "@/lib/api/client";
import type { ContactChannel, ContactSenderRole } from "@/lib/contact/options";

export type ContactFormPayload = {
  fullName: string;
  phone: string;
  email?: string;
  senderRole: ContactSenderRole;
  contactChannel?: ContactChannel;
  courseInterest: string;
  courseInterestOther?: string;
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
  senderRole: string;
  contactChannel: string | null;
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
