import type { UserRole } from "@/lib/auth/types";
import { PAGE_PATHS } from "@/lib/navigation-paths";

export function homePathForRole(role: UserRole): string {
  if (role === "ADMIN") return PAGE_PATHS.admin;
  if (role === "TEACHER") return `${PAGE_PATHS.admin}/classes`;
  if (role === "PARENT") return PAGE_PATHS.parent;
  return PAGE_PATHS.home;
}
