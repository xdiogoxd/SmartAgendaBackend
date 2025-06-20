import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { SpaceOfService } from '@/domain/enterprise/entities/space-of-service';
import { Prisma, spaceOfService as PrismaSpaceOfService } from '@prisma/client';

export class PrismaSpaceOfServiceMapper {
  static toDomain(raw: PrismaSpaceOfService): SpaceOfService {
    return SpaceOfService.create(
      {
        organizationId: new UniqueEntityID(raw.organizationId),
        name: raw.name,
        description: raw.description,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    spaceOfService: SpaceOfService,
  ): Prisma.spaceOfServiceUncheckedCreateInput {
    return {
      organizationId: spaceOfService.organizationId.toString(),
      id: spaceOfService.id.toString(),
      name: spaceOfService.name,
      description: spaceOfService.description,
      createdAt: spaceOfService.createdAt,
      updatedAt: spaceOfService.updatedAt,
    };
  }
}
