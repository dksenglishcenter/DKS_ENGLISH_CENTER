ALTER TABLE "jobs" ADD COLUMN "normalized_title" TEXT;

UPDATE "jobs"
SET "normalized_title" = lower(regexp_replace(trim("title"), '\s+', ' ', 'g'));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "jobs"
    GROUP BY "normalized_title"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Không thể tạo unique normalized_title: đang có vị trí tuyển dụng trùng tên.';
  END IF;
END $$;

ALTER TABLE "jobs" ALTER COLUMN "normalized_title" SET NOT NULL;
CREATE UNIQUE INDEX "jobs_normalized_title_key" ON "jobs"("normalized_title");

ALTER TABLE "career_applications" ADD COLUMN "job_id" TEXT;

UPDATE "career_applications" AS application
SET "job_id" = job."id"
FROM "jobs" AS job
WHERE lower(regexp_replace(trim(application."position"), '\s+', ' ', 'g')) = job."normalized_title";

CREATE INDEX "career_applications_job_id_idx" ON "career_applications"("job_id");

ALTER TABLE "career_applications"
ADD CONSTRAINT "career_applications_job_id_fkey"
FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
