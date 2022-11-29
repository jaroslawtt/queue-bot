/*
  Warnings:

  - Added the required column `students_number` to the `Queue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "students_number" INTEGER NOT NULL;
