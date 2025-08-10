import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { Appointment } from '@/domain/enterprise/entities/appointment';
import { UserRepository } from '@/domain/repositories/user-repository';

import { UserNotFoundError } from '../errors/user-not-found-error';

import { AppointmentNotAvailableError } from '../errors/appointment-not-available-error';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { CheckDateAvaibility } from '../../utils/check-date-avaibility';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { ServiceRepository } from '@/domain/repositories/service-repository';
import { InvalidAppointmentDateError } from '../errors/invalid-appointment-date-error';
import { isPast } from 'date-fns';

export interface CreateAppointmentUseCaseRequest {
  date: Date;
  description: string;
  observations: string;
  organizationId: string;
  serviceId: string;
  spaceOfServiceId: string;
  clientId: string;
}

type CreateAppointmentUseCaseResponse = Either<
  | UserNotFoundError
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
    private userRepository: UserRepository,
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
    clientId,
  }: CreateAppointmentUseCaseRequest): Promise<CreateAppointmentUseCaseResponse> {
    const client = await this.userRepository.findById(clientId);

    const appointmentDate = new Date(date);

    if (!client) {
      return left(new UserNotFoundError(clientId));
    }

    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
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
      observations,
      status: AppointmentStatus.PENDING,
      organizationId: organization.id,
      serviceId: service.id,
      spaceOfServiceId: spaceOfService.id,
      clientId: client.id,
    });

    await this.appointmentRepository.create(appointment);

    return right({
      appointment,
    });
  }
}
