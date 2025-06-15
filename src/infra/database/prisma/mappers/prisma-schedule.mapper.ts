import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { WeekDays } from '@/core/types/weekDays';
import { Schedule } from '@/domain/enterprise/entities/schedule';
import { selectWeekDay } from '@/domain/utils/select-week-day';
import { Prisma, schedule as PrismaSchedule } from '@prisma/client';

export class PrismaScheduleMapper {
  static toDomain(raw: PrismaSchedule): Schedule {
    const weekDay = selectWeekDay(raw.weekDay);

    return Schedule.create(
      {
        organizationId: new UniqueEntityID(raw.organizationId),
        weekDay,
        startHour: raw.startHour,
        endHour: raw.endHour,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toPrisma(schedule: Schedule): Prisma.scheduleUncheckedCreateInput {
    return {
      id: schedule.id.toString(),
      organizationId: schedule.organizationId.toString(),
      weekDay: schedule.weekDay,
      startHour: schedule.startHour,
      endHour: schedule.endHour,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }
}
