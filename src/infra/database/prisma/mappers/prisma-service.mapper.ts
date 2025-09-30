import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Service } from '@/domain/enterprise/entities/service';

import { Prisma, service as PrismaService } from '@prisma/client';

export class PrismaServiceMapper {
  static toDomain(raw: PrismaService): Service {
    return Service.create(
      {
        organizationId: new UniqueEntityID(raw.organizationId),
        name: raw.name,
        description: raw.description,
        duration: raw.duration,
        price: raw.price,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        observations: raw.observations,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(service: Service): Prisma.serviceUncheckedCreateInput {
    return {
      organizationId: service.organizationId.toString(),
      id: service.id.toString(),
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      observations: service.observations,
    };
  }
}
