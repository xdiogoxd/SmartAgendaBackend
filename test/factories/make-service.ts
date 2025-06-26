import { faker } from '@faker-js/faker';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Service, ServiceProps } from '@/domain/enterprise/entities/service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaServiceMapper } from '@/infra/database/prisma/mappers/prisma-service.mapper';
import { Optional } from '@/core/types/optional';

export function makeService(
  override: Partial<ServiceProps> = {},
  id?: UniqueEntityID,
) {
  const service = Service.create(
    {
      organizationId: new UniqueEntityID(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      duration: faker.number.int({ min: 15, max: 180 }),
      price: faker.number.float({ min: 10, max: 200 }),
      createdAt: faker.date.recent(),
      ...override,
    },
    id,
  );
  return service;
}

@Injectable()
export class ServiceFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaService(
    data: Optional<
      ServiceProps,
      'name' | 'description' | 'duration' | 'price' | 'createdAt'
    >,
  ): Promise<Service> {
    const service = makeService(data);

    await this.prisma.service.create({
      data: PrismaServiceMapper.toPrisma(service),
    });

    return service;
  }
}
