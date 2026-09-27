"use client";

import { Inbox } from "lucide-react";

import {
  EmailLink,
  PhoneLink,
  SubmissionsListAdmin,
  type SubmissionsListConfig,
} from "@/components/admin/submissions-list-admin";
import {
  deleteContactSubmission,
  listContactSubmissions,
} from "@/lib/contact/api";
import {
  getWhatsAppHref,
  getZaloChatHrefFromPhone,
} from "@/lib/contact/messaging-links";
import {
  contactChannelLabel,
  contactSenderRoleLabel,
} from "@/lib/contact/options";
import type { ContactSubmission } from "@/lib/contact/types";

function MessagingPhoneCell({ phone }: { phone: string }) {
  const zaloHref = getZaloChatHrefFromPhone(phone);
  const whatsappHref = getWhatsAppHref(phone, "Xin chào, DKS English Center liên hệ tư vấn.");

  return (
    <div className="space-y-1.5">
      <PhoneLink phone={phone} />
      <div className="flex flex-wrap gap-x-2 gap-y-1 pl-6 text-xs font-semibold">
        <a
          href={zaloHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0068FF] underline-offset-2 hover:underline"
        >
          Zalo
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#128C7E] underline-offset-2 hover:underline"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}

const CONFIG: SubmissionsListConfig<ContactSubmission> = {
  idPrefix: "contact-submissions",
  title: "Yêu cầu nhận tư vấn",
  description: "Danh sách thông tin khách hàng gửi từ biểu mẫu tại trang Liên hệ.",
  searchLabel: "Tìm yêu cầu tư vấn",
  searchPlaceholder: "Tìm tên, điện thoại, email, khóa học...",
  unitLabel: "yêu cầu",
  loadingText: "Đang tải yêu cầu tư vấn...",
  nameHeader: "Khách hàng",
  emptyIcon: Inbox,
  emptyTitle: "Chưa có yêu cầu tư vấn",
  emptyDescription: "Dữ liệu khách hàng gửi từ form sẽ xuất hiện tại đây.",
  paginationLabel: "Phân trang yêu cầu tư vấn",
  deleteTitle: "Xóa yêu cầu tư vấn?",
  deleteDescription: (submission) =>
    `Yêu cầu của ${submission.fullName} sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
  deleteAriaLabel: (submission) =>
    `Xóa yêu cầu tư vấn của ${submission.fullName}`,
  columns: [
    {
      key: "phone",
      header: "SĐT / nhắn tin",
      widthClass: "w-[14%]",
      render: (submission) => <MessagingPhoneCell phone={submission.phone} />,
    },
    {
      key: "contactChannel",
      header: "Kênh ưa thích",
      widthClass: "w-[10%]",
      render: (submission) => (
        <span className="text-muted-foreground">
          {contactChannelLabel(submission.contactChannel)}
        </span>
      ),
    },
    {
      key: "senderRole",
      header: "Bạn là…",
      widthClass: "w-[12%]",
      render: (submission) => (
        <span className="text-muted-foreground">
          {contactSenderRoleLabel(submission.senderRole)}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      widthClass: "w-[14%]",
      render: (submission) => <EmailLink email={submission.email} />,
    },
    {
      key: "courseInterest",
      header: "Khóa quan tâm",
      widthClass: "w-[14%]",
      render: (submission) => (
        <span className="break-words text-muted-foreground">
          {submission.courseInterest}
        </span>
      ),
    },
    {
      key: "learningNeeds",
      header: "Nhu cầu học tập",
      widthClass: "w-[14%]",
      render: (submission) =>
        submission.learningNeeds ? (
          <span className="whitespace-pre-wrap [overflow-wrap:anywhere] text-muted-foreground">
            {submission.learningNeeds}
          </span>
        ) : (
          <span className="text-muted-foreground">Không cung cấp</span>
        ),
    },
  ],
  list: listContactSubmissions,
  remove: deleteContactSubmission,
};

export function ContactSubmissionsAdmin() {
  return <SubmissionsListAdmin config={CONFIG} />;
}
