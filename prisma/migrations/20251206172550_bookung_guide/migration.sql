/*
  Warnings:

  - Made the column `guideId` on table `bookings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_guideId_fkey";

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "guideId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
