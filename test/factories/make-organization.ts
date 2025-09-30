import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import {
  Organization,
  OrganizationProps,
} from '@/domain/enterprise/entities/organization';
import { PrismaOrganizationMapper } from '@/infra/database/prisma/mappers/prisma-organization.mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { faker } from '@faker-js/faker';

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
    data: Optional<OrganizationProps, 'name' | 'createdAt'>,
  ): Promise<Organization> {
    const organization = makeOrganization(data);

    await this.prisma.organization.create({
      data: PrismaOrganizationMapper.toPrisma(organization),
    });

    return organization;
  }
}
