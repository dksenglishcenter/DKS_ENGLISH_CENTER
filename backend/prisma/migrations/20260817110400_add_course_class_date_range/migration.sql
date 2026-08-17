-- AlterTable
ALTER TABLE "courses" ADD COLUMN "start_date" DATE,
ADD COLUMN "end_date" DATE;

-- AlterTable
ALTER TABLE "classes" ADD COLUMN "starts_on" DATE,
ADD COLUMN "ends_on" DATE;
