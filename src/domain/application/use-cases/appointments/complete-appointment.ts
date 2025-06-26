import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { Appointment } from '@/domain/enterprise/entities/appointment';

import { UserNotFoundError } from '../errors/user-not-found-error';

import { AppointmentNotAvailableError } from '../errors/appointment-not-available-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { AppointmentStatusInvalidError } from '../errors/appointment-status-invalid-error';

export interface CreateAppointmentUseCaseRequest {
  appointmentId: string;
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
  }: CreateAppointmentUseCaseRequest): Promise<CreateAppointmentUseCaseResponse> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return left(new ResourceNotFoundError(appointmentId));
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

    await this.appointmentRepository.save(
      appointment.id.toString(),
      appointment,
    );

    return right({
      appointment,
    });
  }
}
