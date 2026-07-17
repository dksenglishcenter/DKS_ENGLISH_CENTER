-- Chuẩn hóa dữ liệu cũ thành thứ tự liên tục, ổn định trước khi thêm unique.
WITH ranked_jobs AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      ORDER BY "sort_order" ASC, "created_at" ASC, "id" ASC
    ) - 1 AS "normalized_sort_order"
  FROM "jobs"
)
UPDATE "jobs" AS job
SET "sort_order" = ranked_jobs."normalized_sort_order"
FROM ranked_jobs
WHERE job."id" = ranked_jobs."id";

-- Một thứ tự chỉ được gán cho duy nhất một vị trí tuyển dụng.
CREATE UNIQUE INDEX "jobs_sort_order_key" ON "jobs"("sort_order");
