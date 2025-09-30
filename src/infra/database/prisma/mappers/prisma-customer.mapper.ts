import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Customer } from '@/domain/enterprise/entities/customer';

import { Prisma, customer as PrismaCustomer } from '@prisma/client';

export class PrismaCustomerMapper {
  static toDomain(raw: PrismaCustomer): Customer {
    return Customer.create(
      {
        name: raw.name,
        phone: raw.phone,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        organizationId: new UniqueEntityID(raw.organizationId),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(customer: Customer): Prisma.customerUncheckedCreateInput {
    return {
      id: customer.id.toString(),
      name: customer.name,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      organizationId: customer.organizationId.toString(),
    };
  }
}
