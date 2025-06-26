/*
  Warnings:

  - Added the required column `status` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
