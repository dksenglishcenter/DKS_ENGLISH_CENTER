"use server";

import { cookies } from "next/headers";
import { updateTag } from "next/cache";

import { getApiUrl } from "@/lib/api/config";
import { CONTACT_INFORMATION_CACHE_TAG } from "./constants";

const ADMIN_AUTH_CHECK_TIMEOUT_MS = 5_000;

/**
 * Xóa cache public sau khi admin cập nhật thành công.
 * Luôn xác thực lại quyền ADMIN ở backend vì Server Action cũng là public endpoint.
 */
export async function invalidateContactInformationCache() {
  const cookieStore = await cookies();
  const response = await fetch(`${getApiUrl()}/auth/admin/ping`, {
    method: "GET",
    cache: "no-store",
    headers: {
      cookie: cookieStore.toString(),
    },
    signal: AbortSignal.timeout(ADMIN_AUTH_CHECK_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      "Thông tin đã được lưu nhưng chưa thể đồng bộ cache. Vui lòng tải lại và thử lưu lần nữa.",
    );
  }

  updateTag(CONTACT_INFORMATION_CACHE_TAG);
}
