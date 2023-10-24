-- DropIndex
DROP INDEX "Queue_queue_name_key";

-- AlterTable
ALTER TABLE "Queue" ALTER COLUMN "students_number" SET DEFAULT 34;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telegram_tag" TEXT;
