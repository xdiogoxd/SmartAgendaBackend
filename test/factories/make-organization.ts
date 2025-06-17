import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  Organization,
  OrganizationProps,
} from '@/domain/enterprise/entities/organization';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaOrganizationMapper } from '@/infra/database/prisma/mappers/prisma-organization.mapper';

export function makeOrganization(
  override: Partial<OrganizationProps> = {},
  id?: UniqueEntityID,
) {
  const organization = Organization.create(
    {
      name: faker.commerce.productName(),
      ownerId: new UniqueEntityID(),
      createdAt: faker.date.recent(),
      ...override,
    },
    id,
  );
  return organization;
}

@Injectable()
export class OrganizationFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaOrganization(
    data: Partial<OrganizationProps> = {},
    ownerId: UniqueEntityID,
  ): Promise<Organization> {
    data.ownerId = ownerId;
    const organization = makeOrganization(data);

    await this.prisma.organization.create({
      data: PrismaOrganizationMapper.toPrisma(organization),
    });

    return organization;
  }
}
