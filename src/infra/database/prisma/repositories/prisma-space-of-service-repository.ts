import { Injectable } from '@nestjs/common';

import { SpaceOfService } from '@/domain/enterprise/entities/space-of-service';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';

import { PrismaSpaceOfServiceMapper } from '../mappers/prisma-space-of-service.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaSpaceOfServiceRepository
  implements SpaceOfServiceRepository
{
  constructor(private prisma: PrismaService) {}

  async create(spaceOfService: SpaceOfService): Promise<SpaceOfService> {
    const prismaSpaceOfService = await this.prisma.spaceOfService.create({
      data: PrismaSpaceOfServiceMapper.toPrisma(spaceOfService),
    });

    return PrismaSpaceOfServiceMapper.toDomain(prismaSpaceOfService);
  }

  async findById(
    organizationId: string,
    id: string,
  ): Promise<SpaceOfService | null> {
    const spaceofservice = await this.prisma.spaceOfService.findUnique({
      where: {
        organizationId,
        id,
      },
    });

    if (!spaceofservice) {
      return null;
    }

    return PrismaSpaceOfServiceMapper.toDomain(spaceofservice);
  }

  async findByName(
    organizationId: string,
    name: string,
  ): Promise<SpaceOfService | null> {
    const spaceOfService = await this.prisma.spaceOfService.findFirst({
      where: {
        organizationId,
        name,
      },
    });

    if (!spaceOfService) {
      return null;
    }

    return PrismaSpaceOfServiceMapper.toDomain(spaceOfService);
  }

  async findAllByOrganization(
    organizationId: string,
  ): Promise<SpaceOfService[]> {
    const spaceofservices = await this.prisma.spaceOfService.findMany({
      where: {
        organizationId,
      },
    });

    return spaceofservices.map(PrismaSpaceOfServiceMapper.toDomain);
  }

  async findAll(): Promise<SpaceOfService[]> {
    const spaceofservices = await this.prisma.spaceOfService.findMany();

    return spaceofservices.map(PrismaSpaceOfServiceMapper.toDomain);
  }

  async save(
    organizationId: string,
    id: string,
    data: SpaceOfService,
  ): Promise<SpaceOfService> {
    const prismaSpaceOfService = PrismaSpaceOfServiceMapper.toPrisma(data);

    const spaceOfService = await this.prisma.spaceOfService.update({
      where: {
        organizationId,
        id,
      },
      data: prismaSpaceOfService,
    });

    return PrismaSpaceOfServiceMapper.toDomain(spaceOfService);
  }

  async delete(organizationId: string, id: string): Promise<void> {
    await this.prisma.spaceOfService.delete({
      where: {
        organizationId,
        id,
      },
    });
  }
}
