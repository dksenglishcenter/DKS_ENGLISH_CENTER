-- CreateTable
CREATE TABLE "facility_images" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_page_content" (
    "id" TEXT NOT NULL,
    "vision_image_url" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_page_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cred" TEXT NOT NULL,
    "exp" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "facility_images_is_published_sort_order_idx" ON "facility_images"("is_published", "sort_order");

-- CreateIndex
CREATE INDEX "teachers_is_published_sort_order_idx" ON "teachers"("is_published", "sort_order");
