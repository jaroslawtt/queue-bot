/*
  Warnings:

  - Added the required column `chatId` to the `Queue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "chatId" INTEGER NOT NULL;
