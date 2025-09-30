import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '@/domain/repositories/customer-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

import { CustomerNotFoundError } from '../errors/customer-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface GetCustomerByIdAndOrganizationUseCaseRequest {
  id: string;
  organizationId: string;
}

type GetCustomerByIdAndOrganizationUseCaseResponse = Either<
  OrganizationNotFoundError | CustomerNotFoundError,
  {
    customer: Customer;
  }
>;

@Injectable()
export class GetCustomerByIdAndOrganizationUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute({
    id,
    organizationId,
  }: GetCustomerByIdAndOrganizationUseCaseRequest): Promise<GetCustomerByIdAndOrganizationUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const customer = await this.customerRepository.findByIdAndOrganization(
      id,
      organizationId,
    );

    if (!customer) {
      return left(new CustomerNotFoundError(id));
    }

    return right({
      customer,
    });
  }
}
