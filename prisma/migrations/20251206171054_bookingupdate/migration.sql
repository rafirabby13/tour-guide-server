/*
  Warnings:

  - Added the required column `bookingId` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "bookingId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "reviews_bookingId_idx" ON "reviews"("bookingId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
