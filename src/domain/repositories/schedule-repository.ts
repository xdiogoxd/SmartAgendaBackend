import { Schedule } from '../enterprise/entities/schedule';

export abstract class ScheduleRepository {
  abstract create(schedule: Schedule): Promise<Schedule>;
  abstract findById(id: string): Promise<Schedule | null>;
  abstract findAllByOrganizationId(organizationId: string): Promise<Schedule[]>;
  abstract save(id: string, schedule: Schedule): Promise<Schedule>;
  abstract delete(id: string): Promise<void>;
}
