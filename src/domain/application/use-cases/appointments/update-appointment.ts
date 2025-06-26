import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { Appointment } from '@/domain/enterprise/entities/appointment';
import { UserRepository } from '@/domain/repositories/user-repository';

import { UserNotFoundError } from '../errors/user-not-found-error';

import { AppointmentNotAvailableError } from '../errors/appointment-not-available-error';
import { SpaceOfServiceRepository } from '@/domain/repositories/space-of-service-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { ServiceRepository } from '@/domain/repositories/service-repository';

export interface UpdateAppointmentUseCaseRequest {
  appointmentId: string;
  description: string;
  observations: string;
  serviceId: string;
  spaceOfServiceId: string;
  clientId: string;
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
    private userRepository: UserRepository,
    private spaceOfServiceRepository: SpaceOfServiceRepository,
    private serviceRepository: ServiceRepository,
    private appointmentRepository: AppointmentRepository,
  ) {}

  async execute({
    appointmentId,
    description,
    observations,
    clientId,
    serviceId,
    spaceOfServiceId,
  }: UpdateAppointmentUseCaseRequest): Promise<UpdateAppointmentUseCaseResponse> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return left(new ResourceNotFoundError(appointmentId));
    }

    let updatedClientId = appointment.clientId;
    let updatedServiceId = appointment.serviceId;
    let updatedSpaceOfServiceId = appointment.spaceOfServiceId;

    if (clientId != appointment.clientId.toString()) {
      const client = await this.userRepository.findById(clientId);
      if (!client) {
        return left(new UserNotFoundError(clientId));
      }
      updatedClientId = client.id;
    }

    if (serviceId != appointment.serviceId.toString()) {
      const service = await this.serviceRepository.findById(serviceId);
      if (!service) {
        return left(new ResourceNotFoundError(serviceId));
      }
      updatedServiceId = service.id;
    }

    if (spaceOfServiceId != appointment.spaceOfServiceId.toString()) {
      const spaceOfService =
        await this.spaceOfServiceRepository.findById(spaceOfServiceId);
      if (!spaceOfService) {
        return left(new ResourceNotFoundError(spaceOfServiceId));
      }
      updatedSpaceOfServiceId = spaceOfService.id;
    }

    appointment.description = description;
    appointment.observations = observations;
    appointment.serviceId = updatedServiceId;
    appointment.spaceOfServiceId = updatedSpaceOfServiceId;
    appointment.clientId = updatedClientId;

    await this.appointmentRepository.save(appointmentId, appointment);

    return right({
      appointment,
    });
  }
}
