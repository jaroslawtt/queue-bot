-- DropForeignKey
ALTER TABLE "UsersOnQueues" DROP CONSTRAINT "UsersOnQueues_queueId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnQueues" DROP CONSTRAINT "UsersOnQueues_userId_fkey";

-- AddForeignKey
ALTER TABLE "UsersOnQueues" ADD CONSTRAINT "UsersOnQueues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnQueues" ADD CONSTRAINT "UsersOnQueues_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue"("queue_id") ON DELETE CASCADE ON UPDATE CASCADE;
