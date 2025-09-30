import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, left, right } from '@/core/types/either';
import { Customer } from '@/domain/enterprise/entities/customer';
import { CustomerRepository } from '@/domain/repositories/customer-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { PhoneNumberAlreadyUsedError } from '../errors/phone-number-already-used-error';
import { PhoneNumberMandatoryError } from '../errors/phone-number-mandatory-error';

export interface CreateCustomerUseCaseRequest {
  organizationId: string;
  name: string;
  phone: string;
}

type CreateCustomerUseCaseResponse = Either<
  | OrganizationNotFoundError
  | PhoneNumberAlreadyUsedError
  | PhoneNumberMandatoryError,
  {
    customer: Customer;
  }
>;

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute({
    organizationId,
    name,
    phone,
  }: CreateCustomerUseCaseRequest): Promise<CreateCustomerUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const existingCustomer =
      await this.customerRepository.findByPhoneAndOrganization(
        phone,
        organizationId,
      );

    if (existingCustomer) {
      return left(new PhoneNumberAlreadyUsedError(phone));
    }

    if (phone) {
      // Find all customers in the organization and check if any has the same phone
      const customers =
        await this.customerRepository.findAllByOrganization(organizationId);
      const phoneAlreadyUsed = customers.some(
        (customer) => customer.phone === phone,
      );
      if (phoneAlreadyUsed) {
        return left(new PhoneNumberAlreadyUsedError(phone));
      }
    } else {
      return left(new PhoneNumberMandatoryError());
    }

    const customer = Customer.create({
      organizationId: new UniqueEntityID(organizationId),
      name,
      phone,
    });

    await this.customerRepository.create(customer);

    return right({
      customer,
    });
  }
}
