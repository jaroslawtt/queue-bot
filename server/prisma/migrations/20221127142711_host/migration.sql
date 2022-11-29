/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hostId` to the `Queue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "hostId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Admin";

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
