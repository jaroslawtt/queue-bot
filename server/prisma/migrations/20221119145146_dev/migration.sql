-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Queue" (
    "queue_id" SERIAL NOT NULL,
    "queue_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("queue_id")
);

-- CreateTable
CREATE TABLE "UsersOnQueues" (
    "userId" INTEGER NOT NULL,
    "queueId" INTEGER NOT NULL,

    CONSTRAINT "UsersOnQueues_pkey" PRIMARY KEY ("userId","queueId")
);

-- AddForeignKey
ALTER TABLE "UsersOnQueues" ADD CONSTRAINT "UsersOnQueues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnQueues" ADD CONSTRAINT "UsersOnQueues_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue"("queue_id") ON DELETE RESTRICT ON UPDATE CASCADE;
