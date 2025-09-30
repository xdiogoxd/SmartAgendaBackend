import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, left, right } from '@/core/types/either';
import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '@/domain/repositories/customer-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

import { CustomerNotFoundError } from '../errors/customer-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { PhoneNumberAlreadyUsedError } from '../errors/phone-number-already-used-error';
import { PhoneNumberMandatoryError } from '../errors/phone-number-mandatory-error';

export interface UpdateCustomerUseCaseRequest {
  customerId: string;
  organizationId: string;
  name?: string;
  phone?: string | null;
}

type UpdateCustomerUseCaseResponse = Either<
  | OrganizationNotFoundError
  | PhoneNumberAlreadyUsedError
  | PhoneNumberMandatoryError,
  {
    customer: Customer;
  }
>;

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute({
    customerId,
    organizationId,
    name,
    phone,
  }: UpdateCustomerUseCaseRequest): Promise<UpdateCustomerUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const customer = await this.customerRepository.findByIdAndOrganization(
      customerId,
      organizationId,
    );

    if (!customer) {
      return left(new CustomerNotFoundError(customerId));
    }

    if (phone && phone !== customer.phone) {
      const existingCustomer =
        await this.customerRepository.findByPhoneAndOrganization(
          phone,
          organizationId,
        );
      if (existingCustomer && existingCustomer.id.toString() !== customerId) {
        return left(new PhoneNumberAlreadyUsedError(phone));
      }
    }
    customer.name = name;
    customer.phone = phone;

    await this.customerRepository.save(customerId, customer);

    return right({
      customer,
    });
  }
}
