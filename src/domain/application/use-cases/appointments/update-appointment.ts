import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Appointment } from '@/domain/enterprise/entities/appointment';
import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { CustomerRepository } from '@/domain/repositories/customer-repository';
import { ServiceRepository } from '@/domain/repositories/service-repository';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';

import { AppointmentNotAvailableError } from '../errors/appointment-not-available-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { UserNotFoundError } from '../errors/user-not-found-error';

// todo: add validation if space of service is available and a possible block for completed/canceled appointments

export interface UpdateAppointmentUseCaseRequest {
  organizationId: string;
  appointmentId: string;
  description: string;
  observations: string;
  serviceId: string;
  spaceOfServiceId: string;
  customerPhone: string;
}

type UpdateAppointmentUseCaseResponse = Either<
  UserNotFoundError | AppointmentNotAvailableError | ResourceNotFoundError,
  {
    appointment: Appointment;
  }
>;

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    private customerRepository: CustomerRepository,
    private spaceOfServiceRepository: SpaceOfServiceRepository,
    private serviceRepository: ServiceRepository,
    private appointmentRepository: AppointmentRepository,
  ) {}

  async execute({
    organizationId,
    appointmentId,
    description,
    observations,
    customerPhone,
    serviceId,
    spaceOfServiceId,
  }: UpdateAppointmentUseCaseRequest): Promise<UpdateAppointmentUseCaseResponse> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return left(new ResourceNotFoundError(appointmentId));
    }

    if (organizationId != appointment.organizationId.toString()) {
      return left(new ResourceNotFoundError(organizationId));
    }

    let updatedcustomerId = appointment.customerId;
    let updatedServiceId = appointment.serviceId;
    let updatedSpaceOfServiceId = appointment.spaceOfServiceId;

    if (customerPhone != appointment.customerId.toString()) {
      const customer = await this.customerRepository.findByPhoneAndOrganization(
        customerPhone,
        organizationId,
      );
      if (!customer) {
        return left(new UserNotFoundError(customerPhone));
      }
      updatedcustomerId = customer.id;
    }

    if (serviceId != appointment.serviceId.toString()) {
      const service = await this.serviceRepository.findById(serviceId);
      if (!service) {
        return left(new ResourceNotFoundError(serviceId));
      }
      updatedServiceId = service.id;
    }

    if (spaceOfServiceId != appointment.spaceOfServiceId.toString()) {
      const spaceOfService = await this.spaceOfServiceRepository.findById(
        organizationId,
        spaceOfServiceId,
      );
      if (!spaceOfService) {
        return left(new ResourceNotFoundError(spaceOfServiceId));
      }
      updatedSpaceOfServiceId = spaceOfService.id;
    }

    appointment.description = description;
    appointment.observations = observations;
    appointment.serviceId = updatedServiceId;
    appointment.spaceOfServiceId = updatedSpaceOfServiceId;
    appointment.customerId = updatedcustomerId;

    const responseAppointment = await this.appointmentRepository.save(
      appointmentId,
      appointment,
    );

    return right({
      appointment: responseAppointment,
    });
  }
}
