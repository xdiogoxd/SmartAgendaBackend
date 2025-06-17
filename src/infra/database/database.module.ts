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
  ],
  exports: [
    PrismaService,
    UserRepository,
    ServiceRepository,
    OrganizationRepository,
    ScheduleRepository,
  ],
})
export class DatabaseModule {}
