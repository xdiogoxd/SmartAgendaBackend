import { Injectable } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { Appointment } from '@/domain/enterprise/entities/appointment';
import { AppointmentRepository } from '@/domain/repositories/appointment-repository';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';

import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

export interface ListAppointmentByMonthUseCaseRequest {
  organizationId: string;
  month: number;
  year: number;
}

type ListAppointmentByMonthUseCaseResponse = Either<
  OrganizationNotFoundError,
  {
    appointments: Appointment[];
  }
>;

@Injectable()
export class ListAppointmentsByMonthUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private appointmentRepository: AppointmentRepository,
  ) {}

  async execute({
    organizationId,
    month,
    year,
  }: ListAppointmentByMonthUseCaseRequest): Promise<ListAppointmentByMonthUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const appointments = await this.appointmentRepository.listByMonth(
      organization.id.toString(),
      month,
      year,
    );

    return right({
      appointments,
    });
  }
}
