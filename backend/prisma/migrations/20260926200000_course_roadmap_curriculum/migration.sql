-- AlterTable
ALTER TABLE "courses" ADD COLUMN "curriculum" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "courses" ADD COLUMN "roadmap" JSONB;
