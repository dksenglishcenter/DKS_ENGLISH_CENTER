-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
