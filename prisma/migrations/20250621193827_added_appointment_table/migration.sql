-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "observations" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "spaceOfServiceId" TEXT NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_spaceOfServiceId_fkey" FOREIGN KEY ("spaceOfServiceId") REFERENCES "spaces_of_service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
