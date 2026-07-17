import "server-only";

import { unstable_rethrow } from "next/navigation";
import { cache } from "react";

import { listPublishedJobs } from "./api";
import type { PublicJob } from "./types";

const ERROR_LOG_INTERVAL_MS = 60_000;

let lastKnownJobs: PublicJob[] = [];
let lastErrorLoggedAt = 0;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Lỗi không xác định";
}

export const getPublicJobs = cache(async () => {
  try {
    const response = await listPublishedJobs();
    lastKnownJobs = response.data.map(
      ({
        id,
        title,
        type,
        location,
        salaryType,
        salaryMin,
        salaryMax,
        currency,
        duties,
        benefits,
        req,
      }) => ({
        id,
        title,
        type,
        location,
        salaryType,
        salaryMin,
        salaryMax,
        currency,
        duties,
        benefits,
        req,
      }),
    );
    return lastKnownJobs;
  } catch (error) {
    unstable_rethrow(error);

    const now = Date.now();
    if (now - lastErrorLoggedAt >= ERROR_LOG_INTERVAL_MS) {
      lastErrorLoggedAt = now;
      console.error(
        `[jobs] Không thể tải danh sách công khai: ${getErrorMessage(error)}. ${
          lastKnownJobs.length > 0
            ? "Đang sử dụng dữ liệu thành công gần nhất."
            : "Chưa có dữ liệu dự phòng."
        }`,
      );
    }

    return lastKnownJobs;
  }
});
