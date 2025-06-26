import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';

import { Injectable } from '@nestjs/common';
import {
  SpaceOfService,
  SpaceOfServiceProps,
} from '@/domain/enterprise/entities/space-of-service';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaSpaceOfServiceMapper } from '@/infra/database/prisma/mappers/prisma-space-of-service.mapper';
import { Optional } from '@/core/types/optional';

export function makeSpaceOfService(
  override: Partial<SpaceOfServiceProps> = {},
  id?: UniqueEntityID,
) {
  const spaceofservice = SpaceOfService.create(
    {
      organizationId: new UniqueEntityID(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      ...override,
    },
    id,
  );
  return spaceofservice;
}

@Injectable()
export class SpaceOfServiceFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaSpaceOfService(
    data: Optional<
      SpaceOfServiceProps,
      'name' | 'description' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<SpaceOfService> {
    const spaceofservice = makeSpaceOfService(data);

    await this.prisma.spaceOfService.create({
      data: PrismaSpaceOfServiceMapper.toPrisma(spaceofservice),
    });

    return spaceofservice;
  }
}
