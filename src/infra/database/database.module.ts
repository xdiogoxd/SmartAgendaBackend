import { Module, forwardRef } from '@nestjs/common';

import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { CustomerRepository } from '@/domain/repositories/customer-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { ScheduleRepository } from '@/domain/repositories/schedule-repository';
import { ServiceRepository } from '@/domain/repositories/service-repository';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';
import { UserRepository } from '@/domain/repositories/user-repository';

import { HttpModule } from '../http/http.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaAppointmentRepository } from './prisma/repositories/prisma-appointment-repository';
import { PrismaCustomerRepository } from './prisma/repositories/prisma-customer-repository';
import { PrismaOrganizationRepository } from './prisma/repositories/prisma-organization-repository';
import { PrismaScheduleRepository } from './prisma/repositories/prisma-schedule-repository';
import { PrismaServiceRepository } from './prisma/repositories/prisma-service-repository';
import { PrismaSpaceOfServiceRepository } from './prisma/repositories/prisma-space-of-service-repository';
import { PrismaUserRepository } from './prisma/repositories/prisma-user-repository';

@Module({
  imports: [forwardRef(() => HttpModule)],
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
    {
      provide: ScheduleRepository,
      useClass: PrismaScheduleRepository,
    },
    {
      provide: ServiceRepository,
      useClass: PrismaServiceRepository,
    },
    {
      provide: SpaceOfServiceRepository,
      useClass: PrismaSpaceOfServiceRepository,
    },
    {
      provide: AppointmentRepository,
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: CustomerRepository,
      useClass: PrismaCustomerRepository,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    ServiceRepository,
    OrganizationRepository,
    ScheduleRepository,
    SpaceOfServiceRepository,
    AppointmentRepository,
    CustomerRepository,
  ],
})
export class DatabaseModule {}
