import { Either, left, right } from '@/core/types/either';
import { Injectable } from '@nestjs/common';

import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { ScheduleRepository } from '@/domain/repositories/schedule-repository';
import { Schedule } from '@/domain/enterprise/entities/schedule';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { MissingDayOnScheduleError } from '../errors/missing-day-on-schedule-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { selectWeekDay } from '@/domain/utils/select-week-day';

export interface CreateSchedulesUseCaseRequest {
  organizationId: string;
  day: {
    weekDay:
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday';
    startHour: string;
    endHour: string;
  }[];
}

type CreateSchedulesUseCaseResponse = Either<
  MissingDayOnScheduleError | OrganizationNotFoundError,
  {
    schedules: Schedule[];
  }
>;

@Injectable()
export class CreateSchedulesUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private scheduleRepository: ScheduleRepository,
  ) {}

  async execute({
    organizationId,
    day,
  }: CreateSchedulesUseCaseRequest): Promise<CreateSchedulesUseCaseResponse> {
    const organitazion =
      await this.organizationRepository.findById(organizationId);

    if (!organitazion) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    let schedules: Schedule[] = [];

    for (let i = 0; i < day.length; i++) {
      if (!day[i]) {
        return left(new MissingDayOnScheduleError());
      }

      const weekDay = selectWeekDay(day[i].weekDay);

      const schedule = Schedule.create({
        organizationId: new UniqueEntityID(organizationId),
        weekDay,
        startHour: parseInt(day[i].startHour),
        endHour: parseInt(day[i].endHour),
      });

      await this.scheduleRepository.create(schedule);
      schedules.push(schedule);
    }

    return right({
      schedules,
    });
  }
}
