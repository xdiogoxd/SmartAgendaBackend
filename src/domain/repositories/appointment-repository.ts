import { Appointment } from '../enterprise/entities/appointment';

export abstract class AppointmentRepository {
  abstract create(appointment: Appointment): Promise<Appointment>;
  abstract findById(id: string): Promise<Appointment | null>;
  abstract findByDate(
    organizationId: string,
    date: Date,
  ): Promise<Appointment[]>;

  abstract listByMonth(
    organizationId: string,
    month: number,
    year: number,
  ): Promise<Appointment[]>;
  abstract findByDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]>;
  abstract save(id: string, appointment: Appointment): Promise<Appointment>;
  abstract delete(id: string): Promise<void>;
}
