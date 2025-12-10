/*
  Warnings:

  - The values [ACTIVE] on the enum `TourStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `endTime` on the `BlockedDate` table. All the data in the column will be lost.
  - You are about to drop the column `isAllDay` on the `BlockedDate` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `BlockedDate` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `BlockedDate` table. All the data in the column will be lost.
  - You are about to drop the column `availableDates` on the `Tour` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `Tour` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `location` on the `Tour` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `endTime` on the `TourAvailability` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `TourAvailability` table. All the data in the column will be lost.
  - You are about to alter the column `pricePerHour` on the `TourPricing` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[tourId,guideId,blockedDate]` on the table `BlockedDate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tourId,dayOfWeek,startTimeMinutes,endTimeMinutes]` on the table `TourAvailability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endTimeMinutes` to the `TourAvailability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTimeMinutes` to the `TourAvailability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'CONFIRMED';

-- AlterEnum
BEGIN;
CREATE TYPE "TourStatus_new" AS ENUM ('BLOCKED', 'DRAFT', 'PUBLISHED');
ALTER TABLE "public"."Tour" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Tour" ALTER COLUMN "status" TYPE "TourStatus_new" USING ("status"::text::"TourStatus_new");
ALTER TYPE "TourStatus" RENAME TO "TourStatus_old";
ALTER TYPE "TourStatus_new" RENAME TO "TourStatus";
DROP TYPE "public"."TourStatus_old";
ALTER TABLE "Tour" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Tour" DROP CONSTRAINT "Tour_guideId_fkey";

-- DropIndex
DROP INDEX "BlockedDate_blockedDate_idx";

-- DropIndex
DROP INDEX "BlockedDate_guideId_idx";

-- DropIndex
DROP INDEX "BlockedDate_tourId_blockedDate_startTime_key";

-- DropIndex
DROP INDEX "BlockedDate_tourId_idx";

-- DropIndex
DROP INDEX "TourAvailability_dayOfWeek_idx";

-- DropIndex
DROP INDEX "TourAvailability_tourId_idx";

-- AlterTable
ALTER TABLE "BlockedDate" DROP COLUMN "endTime",
DROP COLUMN "isAllDay",
DROP COLUMN "reason",
DROP COLUMN "startTime";

-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "availableDates",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "location" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "TourAvailability" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "endTimeMinutes" INTEGER NOT NULL,
ADD COLUMN     "startTimeMinutes" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TourPricing" ALTER COLUMN "minGuests" SET DEFAULT 1,
ALTER COLUMN "maxGuests" SET DEFAULT 10,
ALTER COLUMN "pricePerHour" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "BlockedDate_guideId_blockedDate_idx" ON "BlockedDate"("guideId", "blockedDate");

-- CreateIndex
CREATE INDEX "BlockedDate_tourId_blockedDate_idx" ON "BlockedDate"("tourId", "blockedDate");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_tourId_guideId_blockedDate_key" ON "BlockedDate"("tourId", "guideId", "blockedDate");

-- CreateIndex
CREATE INDEX "Tour_guideId_idx" ON "Tour"("guideId");

-- CreateIndex
CREATE INDEX "Tour_status_idx" ON "Tour"("status");

-- CreateIndex
CREATE INDEX "Tour_isDeleted_idx" ON "Tour"("isDeleted");

-- CreateIndex
CREATE INDEX "TourAvailability_tourId_dayOfWeek_isActive_idx" ON "TourAvailability"("tourId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TourAvailability_tourId_dayOfWeek_startTimeMinutes_endTimeM_key" ON "TourAvailability"("tourId", "dayOfWeek", "startTimeMinutes", "endTimeMinutes");

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
