import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserRepository } from '@/domain/repositories/user-repository';
import { PrismaUserRepository } from './prisma/repositories/prisma-user-repository';
import { ServiceRepository } from '@/domain/repositories/service-repository';
import { PrismaServiceRepository } from './prisma/repositories/prisma-service-repository';
import { ScheduleRepository } from '@/domain/repositories/schedule-repository';
import { PrismaScheduleRepository } from './prisma/repositories/prisma-schedule-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { PrismaOrganizationRepository } from './prisma/repositories/prisma-organization-repository';
import { HttpModule } from '../http/http.module';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';
import { PrismaSpaceOfServiceRepository } from './prisma/repositories/prisma-space-of-service-repository';
import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { PrismaAppointmentRepository } from './prisma/repositories/prisma-appointment-repository';

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
  ],
  exports: [
    PrismaService,
    UserRepository,
    ServiceRepository,
    OrganizationRepository,
    ScheduleRepository,
    SpaceOfServiceRepository,
    AppointmentRepository,
  ],
})
export class DatabaseModule {}
