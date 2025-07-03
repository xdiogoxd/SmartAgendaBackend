import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { AppointmentRepository } from '@/domain/repositories/appointment-repository';

import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { AppointmentStatusInvalidError } from '../errors/appointment-status-invalid-error';

export interface DeleteAppointmentUseCaseRequest {
  organizationId: string;
  appointmentId: string;
}

type DeleteAppointmentUseCaseResponse = Either<
  ResourceNotFoundError | AppointmentStatusInvalidError,
  {}
>;

@Injectable()
export class DeleteAppointmentUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute({
    organizationId,
    appointmentId,
  }: DeleteAppointmentUseCaseRequest): Promise<DeleteAppointmentUseCaseResponse> {
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return left(new ResourceNotFoundError(appointmentId));
    }

    if (appointment.organizationId.toString() !== organizationId) {
      return left(new ResourceNotFoundError(organizationId));
    }

    if (appointment.status === AppointmentStatus.FINISHED) {
      return left(
        new AppointmentStatusInvalidError(appointmentId, appointment.status),
      );
    }

    await this.appointmentRepository.delete(appointment.id.toString());

    return right({});
  }
}
