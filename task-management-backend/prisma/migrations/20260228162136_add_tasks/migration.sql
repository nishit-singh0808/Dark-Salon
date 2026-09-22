/*
  Warnings:

  - You are about to drop the column `status` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "status",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt";
