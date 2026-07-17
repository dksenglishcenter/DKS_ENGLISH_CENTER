-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "published_at" DATE NOT NULL,
    "read_time_minutes" INTEGER NOT NULL,
    "cover_image_url" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "intro" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "takeaway" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_category_idx" ON "blog_posts"("category");

-- CreateIndex
CREATE INDEX "blog_posts_featured_is_published_sort_order_idx" ON "blog_posts"("featured", "is_published", "sort_order");
