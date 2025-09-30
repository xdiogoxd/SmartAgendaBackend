import { Injectable } from '@nestjs/common';

import { Service } from '@/domain/enterprise/entities/service';
import { ServiceRepository } from '@/domain/repositories/service-repository';

import { PrismaServiceMapper } from '../mappers/prisma-service.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaServiceRepository implements ServiceRepository {
  constructor(private prisma: PrismaService) {}

  async create(service: Service): Promise<Service> {
    const prismaService = await this.prisma.service.create({
      data: PrismaServiceMapper.toPrisma(service),
    });

    return PrismaServiceMapper.toDomain(prismaService);
  }

  async findById(id: string): Promise<Service | null> {
    const service = await this.prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      return null;
    }

    return PrismaServiceMapper.toDomain(service);
  }

  async findByName(name: string): Promise<Service | null> {
    const service = await this.prisma.service.findFirst({
      where: {
        name,
      },
    });

    if (!service) {
      return null;
    }

    return PrismaServiceMapper.toDomain(service);
  }

  async findAllByOrganization(organizationId: string): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: {
        organizationId,
      },
    });

    return services.map(PrismaServiceMapper.toDomain);
  }

  async findAll(): Promise<Service[]> {
    const services = await this.prisma.service.findMany();

    return services.map(PrismaServiceMapper.toDomain);
  }

  async save(id: string, data: Service): Promise<Service> {
    const prismaService = PrismaServiceMapper.toPrisma(data);

    const service = await this.prisma.service.update({
      where: {
        id,
      },
      data: prismaService,
    });

    return PrismaServiceMapper.toDomain(service);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.service.delete({
      where: {
        id,
      },
    });
  }
}
