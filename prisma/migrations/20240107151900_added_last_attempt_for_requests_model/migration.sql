-- AlterTable
ALTER TABLE "Requests" ADD COLUMN     "lastAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
