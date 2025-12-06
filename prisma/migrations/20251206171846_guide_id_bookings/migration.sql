-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "guideId" TEXT;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guides"("id") ON DELETE SET NULL ON UPDATE CASCADE;
