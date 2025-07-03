import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { Appointment } from '@/domain/enterprise/entities/appointment';

import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { AppointmentStatusInvalidError } from '../errors/appointment-status-invalid-error';

export interface CancelAppointmentUseCaseRequest {
  organizationId: string;
  appointmentId: string;
}

type CancelAppointmentUseCaseResponse = Either<
  ResourceNotFoundError | AppointmentStatusInvalidError,
  {
    appointment: Appointment;
  }
>;

@Injectable()
export class CancelAppointmentUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute({
    appointmentId,
    organizationId,
  }: CancelAppointmentUseCaseRequest): Promise<CancelAppointmentUseCaseResponse> {
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

    appointment.status = AppointmentStatus.CANCELED;
    appointment.canceledAt = new Date();

    await this.appointmentRepository.save(
      appointment.id.toString(),
      appointment,
    );

    return right({
      appointment,
    });
  }
}
