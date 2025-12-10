-- CreateEnum
CREATE TYPE "TourStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "status" "TourStatus" NOT NULL DEFAULT 'ACTIVE';
