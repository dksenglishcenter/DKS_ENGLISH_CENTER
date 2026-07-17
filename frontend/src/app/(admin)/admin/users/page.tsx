import { UsersAdmin } from "@/components/admin/users-admin";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Admin · Người dùng",
  description: "Quản lý tài khoản người dùng.",
  path: "/admin/users",
  noIndex: true,
});

export default function Page() {
  return <UsersAdmin />;
}
