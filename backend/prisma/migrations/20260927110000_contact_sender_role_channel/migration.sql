-- Idempotent: cột có thể đã có từ migrate pdf_feedback trước đó
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "sender_role" TEXT;
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "contact_channel" TEXT;

UPDATE "contact_submissions"
SET "sender_role" = 'khac'
WHERE "sender_role" IS NULL OR TRIM("sender_role") = '';

ALTER TABLE "contact_submissions" ALTER COLUMN "sender_role" SET NOT NULL;
