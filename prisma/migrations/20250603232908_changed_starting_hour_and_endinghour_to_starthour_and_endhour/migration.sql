/*
  Warnings:

  - You are about to drop the column `endingHour` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `startingHour` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `endHour` to the `schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startHour` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "endingHour",
DROP COLUMN "startingHour",
ADD COLUMN     "endHour" INTEGER NOT NULL,
ADD COLUMN     "startHour" INTEGER NOT NULL;
