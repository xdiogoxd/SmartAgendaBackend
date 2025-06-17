import { Schedule } from '@/domain/enterprise/entities/schedule';

export class SchedulePresenter {
  static toHTTP(schedule: Schedule) {
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
