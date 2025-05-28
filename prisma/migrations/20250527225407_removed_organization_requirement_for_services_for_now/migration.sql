/*
  Warnings:

  - You are about to drop the column `organizationId` on the `services` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_organizationId_fkey";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "organizationId";
