/*
  Warnings:

  - You are about to drop the column `workingDay` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `weekDay` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "workingDay",
ADD COLUMN     "weekDay" TEXT NOT NULL;
