import { Injectable } from '@nestjs/common';

import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { Either, left, right } from '@/core/types/either';
import { Appointment } from '@/domain/enterprise/entities/appointment';
import { AppointmentRepository } from '@/domain/repositories/appointment-repository';

import { AppointmentStatusInvalidError } from '../errors/appointment-status-invalid-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

export interface CreateAppointmentUseCaseRequest {
  appointmentId: string;
  organizationId: string;
}

type CreateAppointmentUseCaseResponse = Either<
  ResourceNotFoundError | AppointmentStatusInvalidError,
  {
    appointment: Appointment;
  }
>;

@Injectable()
export class CompleteAppointmentUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute({
    appointmentId,
    organizationId,
  }: CreateAppointmentUseCaseRequest): Promise<CreateAppointmentUseCaseResponse> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return left(new ResourceNotFoundError(appointmentId));
    }

    if (appointment.organizationId.toString() !== organizationId) {
      return left(new ResourceNotFoundError(organizationId));
    }

    if (
      appointment.status === AppointmentStatus.FINISHED ||
      appointment.status === AppointmentStatus.CANCELED
    ) {
      return left(
        new AppointmentStatusInvalidError(appointmentId, appointment.status),
      );
    }

    appointment.status = AppointmentStatus.FINISHED;
    appointment.finishedAt = new Date();

    const responseAppointment = await this.appointmentRepository.save(
      appointment.id.toString(),
      appointment,
    );

    return right({
      appointment: responseAppointment,
    });
  }
}
