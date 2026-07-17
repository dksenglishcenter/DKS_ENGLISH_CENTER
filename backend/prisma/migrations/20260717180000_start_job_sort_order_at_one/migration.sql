-- Đưa toàn bộ giá trị ra khỏi miền thứ tự thật để tránh va chạm unique khi đánh lại số.
UPDATE "jobs"
SET "sort_order" = "sort_order" + 10001;

-- Chuẩn hóa thành dãy liên tục bắt đầu từ 1 theo thứ tự hiện tại.
WITH ranked_jobs AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      ORDER BY "sort_order" ASC, "created_at" ASC, "id" ASC
    ) AS "normalized_sort_order"
  FROM "jobs"
)
UPDATE "jobs" AS job
SET "sort_order" = ranked_jobs."normalized_sort_order"
FROM ranked_jobs
WHERE job."id" = ranked_jobs."id";

ALTER TABLE "jobs" ALTER COLUMN "sort_order" SET DEFAULT 1;
