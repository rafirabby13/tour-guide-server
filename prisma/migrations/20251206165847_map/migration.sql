/*
  Warnings:

  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_tourId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_touristId_fkey";

-- DropTable
DROP TABLE "Review";

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "tourId" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_touristId_idx" ON "reviews"("touristId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "tourists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
