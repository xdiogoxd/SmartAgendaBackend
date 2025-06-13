import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, left, right } from '@/core/types/either';
import { Schedule } from '@/domain/enterprise/entities/schedule';
import { OrganizationRepository } from '@/domain/repositories/organization-repository';
import { ScheduleRepository } from '@/domain/repositories/schedule-repository';
import { Injectable } from '@nestjs/common';
import { MissingDayOnScheduleError } from '../errors/missing-day-on-schedule-error';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { OrganizationNotFoundError } from '../errors/organization-not-found-error';
import { selectWeekDay } from '@/domain/utils/select-week-day';

export interface UpdateSchedulesUseCaseRequest {
  scheduleId: string;
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

type UpdateSchedulesUseCaseResponse = Either<
  MissingDayOnScheduleError | OrganizationNotFoundError,
  {
    schedule: {
      schedules: Schedule[];
    };
  }
>;

@Injectable()
export class UpdateSchedulesUseCase {
  constructor(
    private organizationRepository: OrganizationRepository,
    private scheduleRepository: ScheduleRepository,
  ) {}

  async execute({
    scheduleId,
    organizationId,
    day,
  }: UpdateSchedulesUseCaseRequest): Promise<UpdateSchedulesUseCaseResponse> {
    const organitazion =
      await this.organizationRepository.findById(organizationId);

    if (!organitazion) {
      return left(new OrganizationNotFoundError(organizationId));
    }

    let schedules: Schedule[] = [];

    //Checks if the schedule has all the days of the week

    for (let i = 0; i < 6; i++) {
      if (!day[i]) {
        return left(new MissingDayOnScheduleError());
      }

      const oldSchedule = await this.scheduleRepository.findById(scheduleId);

      if (!oldSchedule) {
        return left(new ResourceNotFoundError(scheduleId));
      }

      const weekDay = selectWeekDay(day[i].weekDay);

      const schedule = Schedule.create(
        {
          organizationId: new UniqueEntityID(organizationId),
          weekDay,
          startHour: parseInt(day[i].startHour),
          endHour: parseInt(day[i].endHour),
        },
        new UniqueEntityID(scheduleId),
      );

      await this.scheduleRepository.save(scheduleId, schedule);
      schedules.push(schedule);
    }

    return right({
      schedule: {
        schedules,
      },
    });
  }
}
