import "server-only";

import { unstable_rethrow } from "next/navigation";
import { cache } from "react";

import { getContactInformation } from "./api";
import type { ContactInformation } from "./types";

const ERROR_LOG_INTERVAL_MS = 60_000;
const PUBLIC_CONTACT_REVALIDATE_SECONDS = 60;

let lastKnownContactInformation: ContactInformation | null = null;
let lastErrorLoggedAt = 0;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Lỗi không xác định";
}

export const getPublicContactInformation = cache(async () => {
  try {
    const response = await getContactInformation({
      revalidate: PUBLIC_CONTACT_REVALIDATE_SECONDS,
    });
    lastKnownContactInformation = response.data;
    return lastKnownContactInformation;
  } catch (error) {
    unstable_rethrow(error);

    const now = Date.now();
    if (now - lastErrorLoggedAt >= ERROR_LOG_INTERVAL_MS) {
      lastErrorLoggedAt = now;
      console.error(
        `[contact-info] Không thể tải dữ liệu: ${getErrorMessage(error)}. ${
          lastKnownContactInformation
            ? "Đang sử dụng dữ liệu thành công gần nhất."
            : "Chưa có dữ liệu dự phòng."
        }`,
      );
    }
    return lastKnownContactInformation;
  }
});
