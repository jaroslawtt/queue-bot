-- CreateTable
CREATE TABLE "Admin" (
    "admin_id" INTEGER NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);
