import { Schedule } from '@/domain/enterprise/entities/schedule';
import { ScheduleRepository } from '@/domain/repositories/schedule-repository';

export class InMemoryScheduleRepository implements ScheduleRepository {
  public items: Schedule[] = [];
  async create(schedule: Schedule) {
    this.items.push(schedule);
    return schedule;
  }

  async findById(id: string): Promise<Schedule | null> {
    const schedule = this.items.find((item) => item.id.toString() === id);

    if (!schedule) {
      return null;
    }

    return schedule;
  }
  async findAllByOrganizationId(organizationId: string): Promise<Schedule[]> {
    const schedules = this.items.filter(
      (item) => item.organizationId.toString() === organizationId,
    );

    schedules.sort((a, b) => a.weekDay - b.weekDay);

    return schedules;
  }

  async save(id: string, data: Schedule): Promise<Schedule> {
    const index = this.items.findIndex((item) => item.id.toString() === id);
    this.items[index] = data;
    return data;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
