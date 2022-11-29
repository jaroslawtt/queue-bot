/*
  Warnings:

  - A unique constraint covering the columns `[queue_name]` on the table `Queue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Queue_queue_name_key" ON "Queue"("queue_name");
