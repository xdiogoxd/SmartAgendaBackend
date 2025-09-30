import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '@/domain/repositories/customer-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface GetCustomersByNameAndOrganizationUseCaseRequest {
  name: string;
  organizationId: string;
}

type GetCustomersByNameAndOrganizationUseCaseResponse = Either<
  OrganizationNotFoundError,
  {
    customers: Customer[];
  }
>;

@Injectable()
export class GetCustomersByNameAndOrganizationUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute({
    name,
    organizationId,
  }: GetCustomersByNameAndOrganizationUseCaseRequest): Promise<GetCustomersByNameAndOrganizationUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const customers =
      await this.customerRepository.findAllByNameAndOrganization(
        name,
        organizationId,
      );

    return right({
      customers: customers ?? [],
    });
  }
}
