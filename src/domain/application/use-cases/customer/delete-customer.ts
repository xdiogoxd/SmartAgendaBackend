import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { CustomerRepository } from '@/domain/repositories/customer-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

import { CustomerNotFoundError } from '../errors/customer-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface DeleteCustomerUseCaseRequest {
  organizationId: string;
  customerId: string;
}

type DeleteCustomerUseCaseResponse = Either<
  OrganizationNotFoundError | CustomerNotFoundError,
  {}
>;

//DeleteCustomer needs cascade delete appointments I'll decide what to do in this case

// @Injectable()
// export class DeleteCustomerUseCase {
//   constructor(
//     private organizationRepository: OrganizationRepository,
//     private customerRepository: CustomerRepository,
//     private appointmentRepository: AppointmentRepository,
//   ) {}

//   async execute({
//     organizationId,
//     customerId,
//   }: DeleteCustomerUseCaseRequest): Promise<DeleteCustomerUseCaseResponse> {
//     const organization =
//       await this.organizationRepository.findById(organizationId);

//     if (!organization) {
//       return left(new OrganizationNotFoundError(organizationId));
//     }

//     const customer = await this.customerRepository.findById(customerId);

//     if (!customer || customer.organizationId.toString() !== organizationId) {
//       return left(new CustomerNotFoundError(customerId));
//     }

//     await this.customerRepository.delete(customerId);

//     return right({});
//   }
// }
