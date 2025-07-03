import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { Appointment } from '@/domain/enterprise/entities/appointment';

import { UserNotFoundError } from '../errors/user-not-found-error';

import { AppointmentNotAvailableError } from '../errors/appointment-not-available-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { CheckDateAvaibility } from '../../utils/check-date-avaibility';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { AppointmentStatus } from '@/core/types/appointment-status-enum';
import { AppointmentStatusInvalidError } from '../errors/appointment-status-invalid-error';

export interface RescheduleAppointmentUseCaseRequest {
  organizationId: string;
  date: Date;
  appointmentId: string;
}

type RescheduleAppointmentUseCaseResponse = Either<
  | UserNotFoundError
  | AppointmentNotAvailableError
  | OrganizationNotFoundError
  | ResourceNotFoundError
  | AppointmentStatusInvalidError,
  {
    appointment: Appointment;
  }
>;

@Injectable()
export class RescheduleAppointmentUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute({
    date,
    appointmentId,
    organizationId,
  }: RescheduleAppointmentUseCaseRequest): Promise<RescheduleAppointmentUseCaseResponse> {
    const convertedDate = new Date(date);

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

    // Wait for the availability check to complete
    const isDateAvailable = await CheckDateAvaibility(
      appointment.organizationId.toString(),
      convertedDate,
      appointment.spaceOfServiceId.toString(),
      this.appointmentRepository,
    );

    if (!isDateAvailable) {
      return left(
        new AppointmentNotAvailableError(convertedDate.toDateString()),
      );
    }

    appointment.date = date;

    await this.appointmentRepository.save(
      appointment.id.toString(),
      appointment,
    );

    return right({
      appointment,
    });
  }
}
