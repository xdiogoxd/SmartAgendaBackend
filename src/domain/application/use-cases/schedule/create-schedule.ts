import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, left, right } from '@/core/types/either';
import { Schedule } from '@/domain/enterprise/entities/schedule';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { ScheduleRepository } from '@/domain/repositories/schedule-repository';

import { DuplicateWeekdayError } from '../errors/duplicated-week-day-error';
import { InvalidHourRangeError } from '../errors/invalid-hour-range-error';
import { MissingDayOnScheduleError } from '../errors/missing-day-on-schedule-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { ScheduleAlreadyExistsError } from '../errors/schedule-already-exists-error';

export interface CreateSchedulesUseCaseRequest {
  organizationId: string;
  days: {
    weekDay: number;
    startHour: number;
    endHour: number;
  }[];
}

type CreateSchedulesUseCaseResponse = Either<
  MissingDayOnScheduleError | OrganizationNotFoundError,
  {
    schedules: Schedule[];
  }
>;

@Injectable()
export class CreateScheduleUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private scheduleRepository: ScheduleRepository,
  ) {}

  async execute({
    organizationId,
    days,
  }: CreateSchedulesUseCaseRequest): Promise<CreateSchedulesUseCaseResponse> {
    const organitazion =
      await this.organizationRepository.findById(organizationId);

    if (!organitazion) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    const existentSchedules =
      await this.scheduleRepository.findAllByOrganizationId(organizationId);

    if (existentSchedules.length > 0) {
      return left(new ScheduleAlreadyExistsError());
    }

    const schedules: Schedule[] = [];

    for (let i = 0; i < days.length; i++) {
      if (!days[i]) {
        return left(new MissingDayOnScheduleError());
      }

      const weekDay = days[i].weekDay;

      //validates if the weekday isn't duplicated, each entry should have a unique weekday
      const isWeekdayDuplicated = days.some(
        (day, index) => index !== i && day.weekDay === weekDay,
      );

      if (isWeekdayDuplicated) {
        return left(new DuplicateWeekdayError());
      }

      if (days[i].startHour > days[i].endHour) {
        return left(new InvalidHourRangeError());
      }

      const schedule = Schedule.create({
        organizationId: new UniqueEntityID(organizationId),
        weekDay,
        startHour: days[i].startHour,
        endHour: days[i].endHour,
      });

      await this.scheduleRepository.create(schedule);
      schedules.push(schedule);
    }

    return right({
      schedules,
    });
  }
}
