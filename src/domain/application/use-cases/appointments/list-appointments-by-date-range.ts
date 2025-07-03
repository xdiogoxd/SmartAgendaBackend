import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { Appointment } from '@/domain/enterprise/entities/appointment';

import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { AppointmentDatesInvalidError } from '../errors/appointment-dates-invalid-error';

export interface ListAppointmentsByDateRangeUseCaseRequest {
  organizationId: string;
  startDate: Date;
  endDate: Date;
}

type ListAppointmentsByDateRangeUseCaseResponse = Either<
  OrganizationNotFoundError | AppointmentDatesInvalidError,
  {
    appointments: Appointment[];
  }
>;

@Injectable()
export class ListAppointmentsByDateRangeUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private appointmentRepository: AppointmentRepository,
  ) {}

  async execute({
    organizationId,
    startDate,
    endDate,
  }: ListAppointmentsByDateRangeUseCaseRequest): Promise<ListAppointmentsByDateRangeUseCaseResponse> {
    const convertedStartDate = new Date(startDate);
    const convertedEndDate = new Date(endDate);

    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    if (startDate > endDate) {
      return left(
        new AppointmentDatesInvalidError(
          convertedStartDate.toDateString(),
          convertedEndDate.toDateString(),
        ),
      );
    }

    const appointments = await this.appointmentRepository.findByDateRange(
      organizationId,
      convertedStartDate,
      convertedEndDate,
    );

    return right({
      appointments,
    });
  }
}
