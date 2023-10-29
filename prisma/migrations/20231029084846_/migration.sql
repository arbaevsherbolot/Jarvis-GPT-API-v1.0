-- CreateEnum
CREATE TYPE "Languages" AS ENUM ('RU', 'EN');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "language" "Languages" NOT NULL DEFAULT 'EN';
