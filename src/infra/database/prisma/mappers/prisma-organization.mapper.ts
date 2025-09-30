import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Organization } from '@/domain/enterprise/entities/organization';

import { Prisma, organization as PrismaOrganization } from '@prisma/client';

export class PrismaOrganizationMapper {
  static toDomain(raw: PrismaOrganization): Organization {
    return Organization.create(
      {
        name: raw.name,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        ownerId: new UniqueEntityID(raw.ownerId),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    organization: Organization,
  ): Prisma.organizationUncheckedCreateInput {
    return {
      id: organization.id.toString(),
      name: organization.name,
      ownerId: organization.ownerId.toString(),
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }
}
