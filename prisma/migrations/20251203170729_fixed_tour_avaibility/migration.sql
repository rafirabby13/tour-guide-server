/*
  Warnings:

  - You are about to drop the column `maxGuests` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Tour` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numGuests` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "numGuests" INTEGER NOT NULL,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "maxGuests",
DROP COLUMN "price";

-- CreateTable
CREATE TABLE "TourPricing" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "minGuests" INTEGER NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourAvailability" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL,
    "tourId" TEXT,
    "guideId" TEXT NOT NULL,
    "blockedDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "isAllDay" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TourPricing_tourId_idx" ON "TourPricing"("tourId");

-- CreateIndex
CREATE UNIQUE INDEX "TourPricing_tourId_minGuests_maxGuests_key" ON "TourPricing"("tourId", "minGuests", "maxGuests");

-- CreateIndex
CREATE INDEX "TourAvailability_tourId_idx" ON "TourAvailability"("tourId");

-- CreateIndex
CREATE INDEX "TourAvailability_dayOfWeek_idx" ON "TourAvailability"("dayOfWeek");

-- CreateIndex
CREATE INDEX "BlockedDate_guideId_idx" ON "BlockedDate"("guideId");

-- CreateIndex
CREATE INDEX "BlockedDate_tourId_idx" ON "BlockedDate"("tourId");

-- CreateIndex
CREATE INDEX "BlockedDate_blockedDate_idx" ON "BlockedDate"("blockedDate");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_tourId_blockedDate_startTime_key" ON "BlockedDate"("tourId", "blockedDate", "startTime");

-- AddForeignKey
ALTER TABLE "TourPricing" ADD CONSTRAINT "TourPricing_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourAvailability" ADD CONSTRAINT "TourAvailability_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
