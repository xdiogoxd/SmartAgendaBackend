import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '@/domain/repositories/customer-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface GetAllCustomersByOrganizationUseCaseRequest {
  organizationId: string;
}

type GetAllCustomersByOrganizationUseCaseResponse = Either<
  OrganizationNotFoundError,
  {
    customers: Customer[];
  }
>;

@Injectable()
export class GetAllCustomersByOrganizationUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute({
    organizationId,
  }: GetAllCustomersByOrganizationUseCaseRequest): Promise<GetAllCustomersByOrganizationUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const customers =
      await this.customerRepository.findAllByOrganization(organizationId);

    return right({
      customers,
    });
  }
}
