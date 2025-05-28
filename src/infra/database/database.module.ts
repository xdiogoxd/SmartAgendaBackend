import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserRepository } from '@/domain/repositories/user-repository';
import { PrismaUserRepository } from './prisma/repositories/prisma-user-repository';
import { ServiceRepository } from '@/domain/repositories/service-repository';
import { PrismaServiceRepository } from './prisma/repositories/prisma-service-repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: ServiceRepository,
      useClass: PrismaServiceRepository,
    },
  ],
  exports: [PrismaService, UserRepository, ServiceRepository],
})
export class DatabaseModule {}
