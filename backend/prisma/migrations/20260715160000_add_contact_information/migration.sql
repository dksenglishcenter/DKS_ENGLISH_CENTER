-- CreateTable
CREATE TABLE "contact_information" (
    "id" TEXT NOT NULL DEFAULT 'contact',
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "map_embed" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_information_pkey" PRIMARY KEY ("id")
);
