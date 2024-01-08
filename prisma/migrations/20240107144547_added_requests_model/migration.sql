-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('STREAM', 'SINGLE');

-- CreateTable
CREATE TABLE "Requests" (
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "type" "RequestType" NOT NULL DEFAULT 'SINGLE',
    "route" TEXT NOT NULL,
    "tries" INTEGER NOT NULL DEFAULT 3
);

-- CreateIndex
CREATE UNIQUE INDEX "Requests_userId_key" ON "Requests"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Requests_chatId_key" ON "Requests"("chatId");

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
