import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { Customer, CustomerProps } from '@/domain/enterprise/entities/customer';
import { PrismaCustomerMapper } from '@/infra/database/prisma/mappers/prisma-customer.mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

import { faker } from '@faker-js/faker';

export function makeCustomer(
  override: Partial<CustomerProps> = {},
  id?: UniqueEntityID,
  organizationId?: UniqueEntityID,
) {
  const customer = Customer.create(
    {
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      organizationId: organizationId,
      createdAt: faker.date.recent(),
      ...override,
    },
    id,
  );
  return customer;
}

@Injectable()
export class CustomerFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaCustomer(
    data: Optional<CustomerProps, 'name' | 'phone'>,
  ): Promise<Customer> {
    const customer = makeCustomer(data);

    await this.prisma.customer.create({
      data: PrismaCustomerMapper.toPrisma(customer),
    });

    return customer;
  }
}
