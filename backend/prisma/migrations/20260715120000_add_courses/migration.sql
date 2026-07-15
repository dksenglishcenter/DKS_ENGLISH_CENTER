-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "tuition" TEXT NOT NULL,
    "duration" TEXT NOT NULL DEFAULT '90 phút/buổi',
    "perks" TEXT[],
    "category" TEXT NOT NULL,
    "cover_image_url" TEXT NOT NULL,
    "accent" TEXT NOT NULL DEFAULT '#F16522',
    "bg" TEXT NOT NULL DEFAULT '#FFF4EC',
    "icon" TEXT NOT NULL DEFAULT '📚',
    "featured" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_category_idx" ON "courses"("category");

-- CreateIndex
CREATE INDEX "courses_featured_is_published_sort_order_idx" ON "courses"("featured", "is_published", "sort_order");
