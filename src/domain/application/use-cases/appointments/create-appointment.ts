import { Injectable } from '@nestjs/common';

import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { Either, left, right } from '@/core/types/either';
import { Appointment } from '@/domain/enterprise/entities/appointment';
import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { CustomerRepository } from '@/domain/repositories/customer-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { ServiceRepository } from '@/domain/repositories/service-repository';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';

import { CheckDateAvaibility } from '../../utils/check-date-avaibility';
import { AppointmentNotAvailableError } from '../errors/appointment-not-available-error';
import { CustomerNotFoundError } from '../errors/customer-not-found-error';
import { InvalidAppointmentDateError } from '../errors/invalid-appointment-date-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

import { isPast } from 'date-fns';

export interface CreateAppointmentUseCaseRequest {
  date: Date;
  description: string;
  observations?: string;
  organizationId: string;
  serviceId: string;
  spaceOfServiceId: string;
  customerPhone: string;
}

type CreateAppointmentUseCaseResponse = Either<
  | CustomerNotFoundError
  | AppointmentNotAvailableError
  | OrganizationNotFoundError
  | ResourceNotFoundError,
  {
    appointment: Appointment;
  }
>;

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    private customerRepository: CustomerRepository,
    private organizationRepository: OrganizationRepository,
    private spaceOfServiceRepository: SpaceOfServiceRepository,
    private serviceRepository: ServiceRepository,
    private appointmentRepository: AppointmentRepository,
  ) {}

  async execute({
    organizationId,
    date,
    description,
    observations,
    serviceId,
    spaceOfServiceId,
    customerPhone,
  }: CreateAppointmentUseCaseRequest): Promise<CreateAppointmentUseCaseResponse> {
    const appointmentDate = new Date(date);

    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const customer = await this.customerRepository.findByPhoneAndOrganization(
      customerPhone,
      organizationId,
    );

    if (!customer) {
      return left(new CustomerNotFoundError(customerPhone));
    }

    const service = await this.serviceRepository.findById(serviceId);

    if (!service) {
      return left(new ResourceNotFoundError(serviceId));
    }

    const spaceOfService = await this.spaceOfServiceRepository.findById(
      organizationId,
      spaceOfServiceId,
    );

    if (!spaceOfService) {
      return left(new ResourceNotFoundError(spaceOfServiceId));
    }

    const isDateAvailable = await CheckDateAvaibility(
      organizationId,
      date,
      spaceOfServiceId,
      this.appointmentRepository,
    );

    if (!isDateAvailable) {
      return left(
        new AppointmentNotAvailableError(appointmentDate.toISOString()),
      );
    }

    if (isPast(date)) {
      return left(
        new InvalidAppointmentDateError(appointmentDate.toISOString()),
      );
    }

    const appointment = Appointment.create({
      date: appointmentDate,
      description,
      observations: observations ? observations : '',
      status: AppointmentStatus.PENDING,
      organizationId: organization.id,
      serviceId: service.id,
      spaceOfServiceId: spaceOfService.id,
      customerId: customer.id,
    });

    await this.appointmentRepository.create(appointment);

    return right({
      appointment,
    });
  }
}
