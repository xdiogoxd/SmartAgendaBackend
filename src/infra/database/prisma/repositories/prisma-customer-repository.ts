import { Injectable } from '@nestjs/common';

import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '@/domain/repositories/customer-repository';

import { PrismaCustomerMapper } from '../mappers/prisma-customer.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private prisma: PrismaService) {}

  async create(customer: Customer): Promise<Customer> {
    const prismaCustomer = PrismaCustomerMapper.toPrisma(customer);

    const createdCustomer = await this.prisma.customer.create({
      data: prismaCustomer,
    });

    return PrismaCustomerMapper.toDomain(createdCustomer);
  }

  async findByIdAndOrganization(
    id: string,
    organizationId: string,
  ): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id, organizationId },
    });

    if (!customer) {
      return null;
    }

    return PrismaCustomerMapper.toDomain(customer);
  }

  async findByPhoneAndOrganization(
    phone: string,
    organizationId: string,
  ): Promise<Customer | null> {
    const customer = await this.prisma.customer.findFirst({
      where: { phone, organizationId },
    });

    if (!customer) {
      return null;
    }

    return PrismaCustomerMapper.toDomain(customer);
  }

  async findAllByNameAndOrganization(
    name: string,
    organizationId: string,
  ): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        organizationId,
      },
    });

    return customers.map(PrismaCustomerMapper.toDomain);
  }

  async findAllByOrganization(organizationId: string): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany({
      where: { organizationId },
    });

    return customers.map(PrismaCustomerMapper.toDomain);
  }

  async save(id: string, data: Customer): Promise<Customer> {
    const prismaCustomer = PrismaCustomerMapper.toPrisma(data);

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: prismaCustomer,
    });

    return PrismaCustomerMapper.toDomain(updatedCustomer);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({
      where: { id },
    });
  }
}
