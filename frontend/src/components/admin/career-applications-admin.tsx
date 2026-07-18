"use client";

import { BriefcaseBusiness, FileUser } from "lucide-react";

import {
  EmailLink,
  PhoneLink,
  SubmissionsListAdmin,
  type SubmissionsListConfig,
} from "@/components/admin/submissions-list-admin";
import {
  deleteCareerApplication,
  listCareerApplications,
} from "@/lib/careers/api";
import type { CareerApplication } from "@/lib/careers/types";

const CONFIG: SubmissionsListConfig<CareerApplication> = {
  idPrefix: "career-applications",
  title: "Đơn ứng tuyển",
  description: "Danh sách ứng viên gửi từ biểu mẫu tại trang Tuyển dụng.",
  searchLabel: "Tìm đơn ứng tuyển",
  searchPlaceholder: "Tìm tên, điện thoại, email, vị trí...",
  unitLabel: "đơn",
  loadingText: "Đang tải đơn ứng tuyển...",
  nameHeader: "Ứng viên",
  emptyIcon: FileUser,
  emptyTitle: "Chưa có đơn ứng tuyển",
  emptyDescription: "Thông tin ứng viên gửi từ form sẽ xuất hiện tại đây.",
  paginationLabel: "Phân trang đơn ứng tuyển",
  deleteTitle: "Xóa đơn ứng tuyển?",
  deleteDescription: (application) =>
    `Đơn ứng tuyển của ${application.fullName} sẽ bị xóa vĩnh viễn và không thể khôi phục.`,
  deleteAriaLabel: (application) =>
    `Xóa đơn ứng tuyển của ${application.fullName}`,
  columns: [
    {
      key: "phone",
      header: "Số điện thoại",
      widthClass: "w-[14%]",
      render: (application) => <PhoneLink phone={application.phone} />,
    },
    {
      key: "email",
      header: "Email",
      widthClass: "w-[18%]",
      render: (application) => <EmailLink email={application.email} />,
    },
    {
      key: "position",
      header: "Vị trí ứng tuyển",
      widthClass: "w-[17%]",
      render: (application) => (
        <span className="flex items-start gap-2 text-muted-foreground">
          <BriefcaseBusiness
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="break-words">{application.position}</span>
        </span>
      ),
    },
    {
      key: "introduction",
      header: "Giới thiệu",
      widthClass: "w-[19%]",
      render: (application) =>
        application.introduction ? (
          <span className="whitespace-pre-wrap [overflow-wrap:anywhere] text-muted-foreground">
            {application.introduction}
          </span>
        ) : (
          <span className="text-muted-foreground">Không cung cấp</span>
        ),
    },
  ],
  list: listCareerApplications,
  remove: deleteCareerApplication,
};

export function CareerApplicationsAdmin() {
  return <SubmissionsListAdmin config={CONFIG} />;
}
