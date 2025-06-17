import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, left, right } from '@/core/types/either';
import { Schedule } from '@/domain/enterprise/entities/schedule';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { ScheduleRepository } from '@/domain/repositories/schedule-repository';
import { Injectable } from '@nestjs/common';
import { MissingDayOnScheduleError } from '../errors/missing-day-on-schedule-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';

//In this use case the user will provide only the schedules that he intends to update, and only those will be updated

export interface UpdateSchedulesUseCaseRequest {
  organizationId: string;
  days: {
    weekDay: number;
    startHour: number;
    endHour: number;
  }[];
}

type UpdateSchedulesUseCaseResponse = Either<
  MissingDayOnScheduleError | OrganizationNotFoundError,
  {
    schedule: {
      schedules: Schedule[];
    };
  }
>;

@Injectable()
export class UpdateScheduleUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private scheduleRepository: ScheduleRepository,
  ) {}

  async execute({
    organizationId,
    days,
  }: UpdateSchedulesUseCaseRequest): Promise<UpdateSchedulesUseCaseResponse> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    let schedules =
      await this.scheduleRepository.findAllByOrganizationId(organizationId);

    for (let i = 0; i < days.length; i++) {
      const weekDay = days[i].weekDay;

      const scheduleToUpdate = schedules.find(
        (schedule) => schedule.weekDay === weekDay,
      );

      if (!scheduleToUpdate) {
        return left(
          new ResourceNotFoundError(`Schedule for weekDay ${weekDay}`),
        );
      }

      const scheduleId = scheduleToUpdate.id.toString();

      // Update the schedule properties
      scheduleToUpdate.startHour = days[i].startHour;
      scheduleToUpdate.endHour = days[i].endHour;

      await this.scheduleRepository.save(scheduleId, scheduleToUpdate);
    }

    return right({
      schedule: {
        schedules,
      },
    });
  }
}
