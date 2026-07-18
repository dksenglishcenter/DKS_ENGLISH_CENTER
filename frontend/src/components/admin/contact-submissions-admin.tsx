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
import type { ContactSubmission } from "@/lib/contact/types";

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
      header: "Số điện thoại",
      widthClass: "w-[14%]",
      render: (submission) => <PhoneLink phone={submission.phone} />,
    },
    {
      key: "email",
      header: "Email",
      widthClass: "w-[18%]",
      render: (submission) => <EmailLink email={submission.email} />,
    },
    {
      key: "courseInterest",
      header: "Khóa quan tâm",
      widthClass: "w-[17%]",
      render: (submission) => (
        <span className="break-words text-muted-foreground">
          {submission.courseInterest}
        </span>
      ),
    },
    {
      key: "learningNeeds",
      header: "Nhu cầu học tập",
      widthClass: "w-[19%]",
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
