-- CreateTable
CREATE TABLE "spaces_of_service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "spaces_of_service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "spaces_of_service" ADD CONSTRAINT "spaces_of_service_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
