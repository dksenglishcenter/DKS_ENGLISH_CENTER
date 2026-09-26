-- CreateTable
CREATE TABLE "event_photos" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "object_position" TEXT NOT NULL DEFAULT 'center',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_photos_is_published_sort_order_idx" ON "event_photos"("is_published", "sort_order");
