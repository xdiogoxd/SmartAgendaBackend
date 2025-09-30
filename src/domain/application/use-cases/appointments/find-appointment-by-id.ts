import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Appointment } from '@/domain/enterprise/entities/appointment';
import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

import { AppointmentNotFoundError } from '../errors/appointment-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface FindAppointmentByIdUseCaseRequest {
  organizationId: string;
  appointmentId: string;
}

type FindAppointmentByIdUseCaseResponse = Either<
  OrganizationNotFoundError | AppointmentNotFoundError,
  {
    appointment: Appointment;
  }
>;

@Injectable()
export class FindAppointmentByIdUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private appointmentRepository: AppointmentRepository,
  ) {}

  async execute({
    organizationId,
    appointmentId,
  }: FindAppointmentByIdUseCaseRequest): Promise<FindAppointmentByIdUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return left(new AppointmentNotFoundError(appointmentId));
    }

    if (appointment.organizationId.toString() !== organizationId) {
      return left(new AppointmentNotFoundError(appointmentId));
    }

    return right({
      appointment,
    });
  }
}
