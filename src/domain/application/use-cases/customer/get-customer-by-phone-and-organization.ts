import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '@/domain/repositories/customer-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

import { CustomerNotFoundError } from '../errors/customer-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface GetCustomerByPhoneAndOrganizationUseCaseRequest {
  phone: string;
  organizationId: string;
}

type GetCustomerByPhoneAndOrganizationUseCaseResponse = Either<
  OrganizationNotFoundError | CustomerNotFoundError,
  {
    customer: Customer;
  }
>;

@Injectable()
export class GetCustomerByPhoneAndOrganizationUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute({
    phone,
    organizationId,
  }: GetCustomerByPhoneAndOrganizationUseCaseRequest): Promise<GetCustomerByPhoneAndOrganizationUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const customer = await this.customerRepository.findByPhoneAndOrganization(
      phone,
      organizationId,
    );

    if (!customer) {
      return left(new CustomerNotFoundError(phone));
    }

    return right({
      customer,
    });
  }
}
