/*
  Warnings:

  - Added the required column `guideId` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "guideId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
