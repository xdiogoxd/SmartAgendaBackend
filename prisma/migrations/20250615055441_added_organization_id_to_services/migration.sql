/*
  Warnings:

  - Added the required column `organizationId` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
